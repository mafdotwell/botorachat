
-- Create storage buckets for bot avatars and knowledge documents
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('bot-avatars', 'bot-avatars', true),
  ('knowledge-documents', 'knowledge-documents', true);

-- Create storage policies for bot avatars (allow authenticated users to upload/view)
CREATE POLICY "Authenticated users can upload bot avatars"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'bot-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view bot avatars"
ON storage.objects FOR SELECT 
USING (bucket_id = 'bot-avatars');

CREATE POLICY "Users can update their own bot avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'bot-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own bot avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'bot-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for knowledge documents
CREATE POLICY "Authenticated users can upload knowledge documents"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'knowledge-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their own knowledge documents"
ON storage.objects FOR SELECT 
USING (bucket_id = 'knowledge-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own knowledge documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'knowledge-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own knowledge documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'knowledge-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
