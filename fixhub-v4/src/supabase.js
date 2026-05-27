import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tkuwxamldedwnrkqklrl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrdXd4YW1sZGVkd25ya3FrbHJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjU3NTQsImV4cCI6MjA5NDcwMTc1NH0.vZkGPfN4kYKHQ2z1pNnmXDFXJsGr-S1gLgXTRz9D5Mk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
