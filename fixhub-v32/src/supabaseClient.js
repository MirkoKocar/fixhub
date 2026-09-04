import { createClient } from '@supabase/supabase-js'

// Tu URL de Supabase ya configurada
const supabaseUrl = 'https://qrxkrqfcltdoaqsggwal.supabase.co'

// Encuentras esta clave en Supabase -> Project Settings -> API (anon public key)
const supabaseAnonKey = 'TU_CLAVE_ANON_PUBLIC_DE_SUPABASE' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
