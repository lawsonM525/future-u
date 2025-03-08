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
    console.log('Processing NEW AND IMPROVED career data...')
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
    const finalTweets = fs.readFileSync(
      path.join(process.cwd(), 'data/Final Tweets.csv'),
      'utf-8'
    )

    const healthCareData = fs.readFileSync(
      path.join(process.cwd(), 'data/Healthcare Workforce Mental Health Dataset.csv'),
      'utf-8'
    )

    const helpfulRedditPosts = fs.readFileSync(
      path.join(process.cwd(), 'data/helpfulRedditPosts.csv'),
      'utf-8'
    )

    const jobTweets = fs.readFileSync(
      path.join(process.cwd(), 'data/Job_Tweets.csv'),
      'utf-8'
    ) 

    const redditComments = fs.readFileSync(
      path.join(process.cwd(), 'data/reddit_comments_combined.csv'),
      'utf-8'
    ) 

    const redditTales = fs.readFileSync(
      path.join(process.cwd(), 'data/reddit_tales_from_the_job.csv'),
      'utf-8'
    ) 

    const salaries = fs.readFileSync(
      path.join(process.cwd(), 'data/salaries.csv'),
      'utf-8'
    ) 

    console.log('All data files read successfully')
    
    
    

    // Parse CSVs with the options
    const twitterPosts = parse(twitterData, CSV_PARSE_OPTIONS)
    const redditPosts = parse(redditData, CSV_PARSE_OPTIONS)
    const dataAnalystJobs = parse(dataAnalystData, CSV_PARSE_OPTIONS)
    const linkedinJobs = parse(linkedinData, CSV_PARSE_OPTIONS)
    const finalTweetsData = parse(finalTweets, CSV_PARSE_OPTIONS)
    const healthcareData = parse(healthCareData, CSV_PARSE_OPTIONS)
    const helpfulRedditPostsData = parse(helpfulRedditPosts, CSV_PARSE_OPTIONS)
    const jobTweetsData = parse(jobTweets, CSV_PARSE_OPTIONS)
    const redditCommentsData = parse(redditComments, CSV_PARSE_OPTIONS)
    const redditTalesData = parse(redditTales, CSV_PARSE_OPTIONS)
    const salariesData = parse(salaries, CSV_PARSE_OPTIONS)
    console.log('All data parsed successfully')

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
        })),
      ...finalTweetsData
        .filter((post: any) => post.Tweets && post.Tweets.length > 50)
        .map((post: any) => ({
          text: post.Tweets,  
          source: 'final_tweets'
        })),
      ...healthcareData
        .filter((post: any) => post["Employee Type"] && post["Workplace Factor"] && post["Stress Level"] && post["Burnout Frequency"] && post["Job Satisfaction"])
        .map((post: any) => ({
          text: `Employee Type: ${post["Employee Type"]}\nWorkplace Factor: ${post["Workplace Factor"]}\nStress Level: ${post["Stress Level"]}\nBurnout Frequency: ${post["Burnout Frequency"]}\nJob Satisfaction: ${post["Job Satisfaction"]}`,
          source: 'healthcare_data'
        })),
      ...helpfulRedditPostsData
        .filter((post: any) => post.postTitle && post.postBody && post.postBody.length > 50)
        .map((post: any) => ({
          text: `Title: ${post.postTitle}\nBody: ${post.postBody}`,
          source: 'helpful_reddit_posts'
        })),    
      ...jobTweetsData
        .filter((post: any) => post.Text && post.Text.length > 50)
        .map((post: any) => ({
          text: post.Text,
          source: 'job_tweets'
        })),
      ...redditCommentsData
        .filter((post: any) => post.CommentBody && post.CommentBody.length > 50)
        .map((post: any) => ({
          text: post.CommentBody,
          source: 'reddit_comments'
        })),
      ...redditTalesData
        .filter((post: any) => post.title && post.body && post.body.length > 50)
        .map((post: any) => ({
          text: `Title: ${post.title}\nBody: ${post.body}`,
          source: 'reddit_tales'
        })),
      ...salariesData
        .filter((post: any) => post.job_title && post.experience_level)
        .map((post: any) => ({
          text: `Job Title: ${post.job_title}\nExperience Level: ${post.experience_level}`,
          source: 'salaries'
        })) 
    ]

    console.log(`${careerAdvice.length} pieces of career advice processed successfully`)

    console.log(`Processing ${careerAdvice.length} pieces of career advice`)

    // Add startBatch to skip previously processed batches
    const batchSize = 100
    const startBatch = 1412
    const startIndex = startBatch * batchSize

    for (let i = startIndex; i < careerAdvice.length; i += batchSize) {
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