import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tkuwxamldedwnrkqklrl.supabase.co'
const supabaseAnonKey = 'sb_publishable_zcdeU998Z3sy_uqN8MdQaQ_nsMe_J-N'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
