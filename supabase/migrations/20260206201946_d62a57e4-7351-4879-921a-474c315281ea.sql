-- Add UPDATE policy for mining_entries table
CREATE POLICY "Users can update their own mining entries" 
ON public.mining_entries 
FOR UPDATE 
USING (auth.uid() = user_id);