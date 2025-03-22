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
            /* Control page breaks */
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
              display: flex;
              flex-direction: column;
            }

            .container {
              width: 100%;
              max-width: 100%;
              margin: 0 auto;
              background-color: #18181B;
              padding: 5rem 4rem;
              flex: 1;
            }

            .header {
              margin-bottom: 3rem;
            }

            .title {
              color: #FACC15;
              font-size: 2rem;
              font-weight: 700;
              margin-bottom: 0.75rem;
            }

            .subtitle {
              color: #71717A;
              font-size: 1rem;
            }

            .content {
              color: #A1A1AA;
            }

            /* Keep headings with their content */
            .section-wrapper {
              break-inside: avoid-page;
              page-break-inside: avoid;
              margin-bottom: 2.5rem;
            }

            /* Prevent unwanted breaks */
            h1, h2, h3, h4, h5, h6 {
              break-after: avoid;
              break-inside: avoid;
              page-break-after: avoid;
              page-break-inside: avoid;
              color: #FACC15;
              font-weight: 600;
              margin-top: 2.5rem;
              margin-bottom: 1.25rem;
            }

            h1 { font-size: 1.75rem; }
            h2 { font-size: 1.5rem; }
            h3 { font-size: 1.25rem; }

            ul, ol {
              break-inside: avoid-page;
              page-break-inside: avoid;
              list-style-type: disc;
              padding-left: 1.5rem;
              margin: 1.25rem 0;
            }

            li {
              break-inside: avoid;
              page-break-inside: avoid;
              margin: 0.75rem 0;
              color: #A1A1AA;
            }

            p {
              orphans: 4;
              widows: 4;
              margin: 1.25rem 0;
              color: #A1A1AA;
            }

            strong, b {
              color: #FACC15;
              font-weight: 600;
            }

            em, i {
              font-style: italic;
              color: #D4D4D8;
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
    
    // Process the HTML to wrap sections with their headings
    await page.evaluate(() => {
      // Find all h2 and h3 headings
      const headings = document.querySelectorAll('h2, h3');
      
      // For each heading, wrap it and its content until the next heading
      headings.forEach((heading) => {
        // Create a wrapper div
        const wrapper = document.createElement('div');
        wrapper.className = 'section-wrapper';
        
        // Insert the wrapper before the heading
        if (heading.parentNode) {
          heading.parentNode.insertBefore(wrapper, heading);
          
          // Move the heading into the wrapper
          wrapper.appendChild(heading);
          
          // Move all siblings until the next heading into the wrapper
          let nextSibling = wrapper.nextSibling;
          while (nextSibling && !['H2', 'H3'].includes(nextSibling.nodeName)) {
            const current = nextSibling;
            nextSibling = nextSibling.nextSibling;
            wrapper.appendChild(current);
          }
        }
      });
    });
    
    // Wait for fonts to load and DOM manipulation to complete
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate PDF with adjusted options
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      scale: 0.9, // Slightly scale down content to fit better
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
