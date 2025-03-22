import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { auth } from '@/app/utils/authOptions'
import { marked } from 'marked'

export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { content, userName, date } = await request.json()

    // Convert markdown to HTML
    const htmlContent = marked(content, {
      gfm: true,
      breaks: true
    })

    // Launch Puppeteer with proper configuration
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()

    // Set viewport to ensure all content is captured
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 1,
    })

    // Generate HTML with the same styling as the report page
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
          <style>
            @page {
              margin: 0;
              size: A4;
            }
            
            * {
              box-sizing: border-box;
            }
            
            html, body {
              margin: 0;
              padding: 0;
              background-color: #09090B;
              height: 100%;
            }
            
            body {
              color: #A1A1AA;
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              line-height: 1.6;
            }
            
            .container {
              width: 100%;
              max-width: 100%;
              margin: 0 auto;
              background-color: #18181B;
              padding: 60px 50px;
            }
            
            .header {
              margin-bottom: 40px;
            }
            
            .title {
              color: #FACC15;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            
            .subtitle {
              color: #71717A;
              font-size: 16px;
            }
            
            .content {
              color: #A1A1AA;
            }
            
            h1, h2, h3, h4, h5, h6 {
              color: #FACC15;
              font-weight: 600;
              margin-top: 40px;
              margin-bottom: 20px;
              page-break-after: avoid;
              page-break-inside: avoid;
            }
            
            h1 { font-size: 24px; }
            h2 { font-size: 22px; }
            h3 { font-size: 20px; }
            
            h2 + p, h3 + p, h2 + ul, h3 + ul {
              page-break-before: avoid;
            }
            
            ul, ol {
              list-style-type: disc;
              padding-left: 25px;
              margin: 20px 0;
              page-break-inside: avoid;
            }
            
            li {
              margin: 12px 0;
              color: #A1A1AA;
              page-break-inside: avoid;
            }
            
            p {
              margin: 20px 0;
              color: #A1A1AA;
              orphans: 4;
              widows: 4;
            }
            
            strong, b {
              color: #FACC15;
              font-weight: 600;
            }
            
            em, i {
              font-style: italic;
              color: #D4D4D8;
            }
            
            /* Force page breaks before major sections */
            h2 {
              page-break-before: always;
            }
            
            /* But don't force a page break for the first h2 */
            h2:first-of-type {
              page-break-before: avoid;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">Career Strategy Report</div>
              <div class="subtitle">
                Prepared for ${userName || 'User'} on ${new Date(date).toLocaleDateString()}
              </div>
            </div>
            <div class="content">
              ${htmlContent}
            </div>
          </div>
        </body>
      </html>
    `

    // Set content and generate PDF
    await page.setContent(html)
    
    // Wait for fonts to load
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate PDF with adjusted options
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    })

    await browser.close()

    // Return PDF as binary
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=career-strategy.pdf'
      }
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
