"use client";

import { createClient } from 'supabase-js';

const supabaseUrl = 'https://betclysjesjqdvkpbexe.supabase.co';
const supabaseKey = 'sb_publishable_cnnlIaVWbW-hf38TY15ZeQ_-8KYoWm7';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;