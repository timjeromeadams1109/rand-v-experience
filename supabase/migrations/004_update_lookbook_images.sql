-- Update lookbook with African American barbershop imagery
-- These images feature African American men getting haircuts for better audience engagement

-- Clear existing lookbook items and add new ones with diverse imagery
DELETE FROM public.lookbook;

INSERT INTO public.lookbook (title, description, image_url, category) VALUES
  ('The Clean Fade', 'A crisp mid-fade with sharp lines and flawless blending. The signature Rand V precision.', 'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=800&q=80', 'fade'),
  ('The Executive Cut', 'Sharp, professional styling for the modern gentleman. Boardroom ready.', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80', 'taper'),
  ('The High Top Fade', 'Classic high top with precision edges. A timeless look reimagined.', 'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80', 'fade'),
  ('The Beard Sculpt', 'Precision beard shaping with clean edges and perfect symmetry. Full service excellence.', 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800&q=80', 'beard'),
  ('The Low Skin Fade', 'Subtle and sophisticated. A low skin fade that transitions seamlessly.', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80', 'fade'),
  ('The Fresh Cut', 'The complete transformation. Clean lines, perfect shape, confidence restored.', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80', 'signature'),
  ('The Wave Check', 'Brush work excellence with a crisp lineup. 360 waves perfected.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', 'waves'),
  ('The Temple Fade', 'Clean temple fade with natural texture on top. Versatile and sharp.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80', 'taper'),
  ('The Drop Fade', 'Modern drop fade following the natural hairline. Contemporary excellence.', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80', 'fade'),
  ('The Afro Taper', 'Natural texture meets precision tapering. Celebrating authentic style.', 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80', 'afro');
