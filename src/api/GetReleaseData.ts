"use client";

import { supabase } from '../config';

const GetReleaseData = async () => {
  const { data, error } = await supabase
    .from('releases')
    .select(['*'])
    .eq('artist_id', artistId);

  if (error) return console.error(error);
  return data;
};

export default GetReleaseData;