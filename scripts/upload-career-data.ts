import 'dotenv/config'
import * as dotenv from 'dotenv'

// Load .env.local file
dotenv.config({ path: '.env.local' })

import { OpenAI } from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
})

const index = pinecone.index(process.env.PINECONE_INDEX as string)

// CSV Parse options to handle various CSV formats
const CSV_PARSE_OPTIONS = {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  trim: true,
  bom: true // Handle UTF-8 BOM
}

async function processCareerData() {
  try {
    // Read and parse CSV files
    const twitterData = fs.readFileSync(
      path.join(process.cwd(), 'data/dataset_easy-twitter-search-scraper_2024-12-15_10-22-18-302.csv'),
      'utf-8'
    )
    const redditData = fs.readFileSync(
      path.join(process.cwd(), 'data/dataset_reddit-scraper-task_2024-12-15_10-08-48-951.csv'),
      'utf-8'
    )
    const dataAnalystData = fs.readFileSync(
      path.join(process.cwd(), 'data/DataAnalyst.csv'),
      'utf-8'
    )
    const linkedinData = fs.readFileSync(
      path.join(process.cwd(), 'data/linkdin_Job_data.csv'),
      'utf-8'
    )

    // Parse CSVs with the options
    const twitterPosts = parse(twitterData, CSV_PARSE_OPTIONS)
    const redditPosts = parse(redditData, CSV_PARSE_OPTIONS)
    const dataAnalystJobs = parse(dataAnalystData, CSV_PARSE_OPTIONS)
    const linkedinJobs = parse(linkedinData, CSV_PARSE_OPTIONS)

    // Combine relevant career advice from all sources
    const careerAdvice = [
      ...twitterPosts
        .filter((post: any) => post.text && post.text.length > 50)
        .map((post: any) => ({
          text: post.text,
          source: 'twitter'
        })),
      ...redditPosts
        .filter((post: any) => post.text && post.text.length > 50)
        .map((post: any) => ({
          text: post.text,
          source: 'reddit'
        })),
      ...dataAnalystJobs
        .filter((job: any) => job["Job Description"])
        .map((job: any) => ({
          text: `Job Title: ${job["Job Title"]}\nSalary: ${job["Salary Estimate"]}\nCompany: ${job["Company Name"]}\nLocation: ${job["Location"]}\nDescription: ${job["Job Description"]}`,
          source: 'data_analyst_jobs'
        })),
      ...linkedinJobs
        .filter((job: any) => job.job_details)
        .map((job: any) => ({
          text: `Job Title: ${job.job}\nCompany: ${job.company_name}\nLocation: ${job.location}\nWork Type: ${job.work_type}\nDescription: ${job.job_details}`,
          source: 'linkedin_jobs'
        }))
    ]

    console.log(`Processing ${careerAdvice.length} pieces of career advice`)

    // Generate embeddings in batches
    const batchSize = 100
    for (let i = 0; i < careerAdvice.length; i += batchSize) {
      const batch = careerAdvice.slice(i, i + batchSize)
      
      // Generate embeddings for batch
      const embeddings = await Promise.all(
        batch.map(async (advice) => {
          const embedding = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: advice.text,
          })
          return {
            embedding: embedding.data[0].embedding,
            text: advice.text,
            source: advice.source
          }
        })
      )

      // Upsert vectors to Pinecone
      await index.upsert(
        embeddings.map((item, j) => ({
          id: `career-${i + j}`,
          values: item.embedding,
          metadata: {
            text: item.text,
            source: item.source
          }
        }))
      )

      console.log(`Uploaded batch ${i/batchSize + 1}`)
    }

    console.log('Successfully uploaded all career advice to Pinecone')

  } catch (error) {
    console.error('Error processing career data:', error)
  }
}

processCareerData() 