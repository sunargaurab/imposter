-- =========================================================================
-- IMPOSTER SEED DATA: 10 CATEGORIES
-- =========================================================================

INSERT INTO categories (id, name, tagline, description, icon, accent_gradient) VALUES
('celebrities', 'Celebrities', 'Famous people everyone knows', 'Pop stars, Hollywood legends, internet icons, and performers.', 'Sparkles', 'from-amber-400 via-rose-500 to-purple-600'),
('politicians', 'Leaders & History', 'Historical figures and global rulers', 'Presidents, prime ministers, emperors, and revolutionary icons.', 'Landmark', 'from-blue-500 via-indigo-600 to-slate-900'),
('food', 'Food & Cuisine', 'Delicious things people love to eat', 'Comfort foods, global delicacies, street treats, and desserts.', 'Utensils', 'from-orange-500 via-amber-500 to-red-500'),
('movies', 'Movies & TV', 'Films, blockbusters and classic series', 'Legendary franchises, bingeable shows, cinematic masterpieces.', 'Clapperboard', 'from-purple-500 via-pink-600 to-red-600'),
('sports', 'Sports & Athletes', 'Games, tournaments and athletic legends', 'Olympic events, famous sports leagues, gear, and champions.', 'Trophy', 'from-emerald-400 via-teal-500 to-cyan-600'),
('animals', 'Animals & Wildlife', 'Creatures of land, air and deep sea', 'Apex predators, ocean giants, exotic birds, and companions.', 'PawPrint', 'from-lime-400 via-emerald-600 to-teal-800'),
('countries', 'Countries & Wonders', 'Nations, monuments and epic destinations', 'Ancient ruins, iconic monuments, natural wonders, and countries.', 'Globe2', 'from-cyan-400 via-blue-600 to-indigo-800'),
('brands', 'Brands & Companies', 'Iconic logos and consumer giants', 'Tech giants, luxury fashion, automakers, and lifestyle brands.', 'Flame', 'from-rose-500 via-fuchsia-600 to-violet-700'),
('technology', 'Tech & Gaming', 'Inventions, gadgets and gaming universes', 'Artificial intelligence, space travel, video game hits, and futuristic tech.', 'Cpu', 'from-violet-500 via-indigo-500 to-sky-500'),
('places', 'Places & Cities', 'World capitals, bustling cities and secret havens', 'Iconic metropolises, tropical islands, and travel spots.', 'MapPin', 'from-teal-400 via-sky-500 to-blue-700')
ON CONFLICT (id) DO NOTHING;

-- Words for Celebrities
INSERT INTO category_words (category_id, word) VALUES
('celebrities', 'Taylor Swift'),
('celebrities', 'Cristiano Ronaldo'),
('celebrities', 'Elon Musk'),
('celebrities', 'Zendaya'),
('celebrities', 'Keanu Reeves'),
('celebrities', 'Rihanna'),
('celebrities', 'Lionel Messi'),
('celebrities', 'Beyoncé'),
('celebrities', 'Dwayne The Rock Johnson'),
('celebrities', 'Leonardo DiCaprio'),
('celebrities', 'Billie Eilish'),
('celebrities', 'MrBeast'),
('celebrities', 'Tom Cruise'),
('celebrities', 'Ariana Grande'),
('celebrities', 'Drake'),
('celebrities', 'Selena Gomez'),
('celebrities', 'Brad Pitt'),
('celebrities', 'Kim Kardashian'),
('celebrities', 'Kanye West'),
('celebrities', 'Lady Gaga');

-- Words for Food
INSERT INTO category_words (category_id, word) VALUES
('food', 'Pizza Margherita'),
('food', 'Sushi Roll'),
('food', 'Cheeseburger'),
('food', 'Tacos al Pastor'),
('food', 'Croissant'),
('food', 'Chicken Biryani'),
('food', 'Ramen Noodles'),
('food', 'Steak Frites'),
('food', 'Pasta Carbonara'),
('food', 'Dim Sum'),
('food', 'Chocolate Brownie'),
('food', 'Peking Duck'),
('food', 'French Fries'),
('food', 'Butter Chicken'),
('food', 'Tiramisu');
