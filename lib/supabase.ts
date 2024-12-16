import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://pybcpkjbuqqmbslyfpuq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YmNwa2pidXFxbWJzbHlmcHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzMTM2NzYsImV4cCI6MjA0OTg4OTY3Nn0.s1u6kuR9x61fTq_2dXrDFNmDxu6nSRDO3VqUC-ncH-A'
) 