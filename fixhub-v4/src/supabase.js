import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tkuwxamldedwnrkqklrl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrdXd4YW1sZGVkd25ya3FrbHJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczOTg0NzksImV4cCI6MjA2Mjk3NDQ3OX0.AzMDsBIOWmQRsxlp2y55U6YG8JTnkFLJRvPy48DIYHI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
