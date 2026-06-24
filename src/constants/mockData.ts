export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories: number;
  rating: number;
  reviewsCount: number;
  chefName: string;
  chefAvatar: string;
  category: string;
  ingredients: string[];
  instructions: string[];
}

export const CATEGORIES = ['All', 'Breakfast', 'Italian', 'Mexican', 'Desserts', 'Seafood', 'Drinks'];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Garlic Butter Shrimp',
    description: 'Juicy, plump shrimp seared in a rich garlic butter sauce, finished with fresh parsley and a splash of lemon juice. A quick gourmet dish!',
    image: 'https://images.unsplash.com/photo-1625938146369-adc83368bda7?auto=format&fit=crop&q=80&w=600',
    duration: 15,
    difficulty: 'Easy',
    calories: 280,
    rating: 4.8,
    reviewsCount: 142,
    chefName: 'Chef Giovanni',
    chefAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=150',
    category: 'Seafood',
    ingredients: [
      '1 lb large shrimp, peeled and deveined',
      '4 tbsp unsalted butter',
      '5 cloves garlic, minced',
      '1/4 cup chicken broth or white wine',
      '1 tbsp fresh lemon juice',
      '2 tbsp fresh parsley, chopped',
      'Salt and freshly cracked black pepper to taste'
    ],
    instructions: [
      'Pat the shrimp dry with paper towels and season with salt and pepper.',
      'Melt 2 tablespoons of butter in a large skillet over medium-high heat. Add the shrimp in a single layer and cook for 1-2 minutes per side until pink and opaque.',
      'Remove shrimp from the skillet and set aside.',
      'Add the remaining butter and garlic to the skillet. Sauté for about 30 seconds until fragrant.',
      'Pour in the chicken broth (or wine) and lemon juice. Bring to a simmer and let reduce by half.',
      'Return shrimp to the skillet, toss in the sauce for 30 seconds, garnish with parsley, and serve hot.'
    ]
  },
  {
    id: '2',
    title: 'Creamy Tuscan Chicken',
    description: 'Tender chicken breasts simmered in a luscious cream sauce filled with sun-dried tomatoes, spinach, and garlic. Pure comfort food.',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=600',
    duration: 30,
    difficulty: 'Medium',
    calories: 450,
    rating: 4.9,
    reviewsCount: 328,
    chefName: 'Chef Isabella',
    chefAvatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=150',
    category: 'Italian',
    ingredients: [
      '2 large chicken breasts, halved horizontally',
      '1 tbsp olive oil',
      '1 cup heavy cream',
      '1/2 cup chicken broth',
      '1 tsp garlic powder',
      '1 cup fresh spinach',
      '1/2 cup sun-dried tomatoes, chopped',
      '1/2 cup freshly grated Parmesan cheese',
      'Salt and Italian seasoning to taste'
    ],
    instructions: [
      'Season chicken breasts with salt, pepper, and garlic powder.',
      'Heat olive oil in a large skillet over medium-high heat. Cook chicken for 5-6 minutes on each side, or until golden brown and cooked through. Remove chicken and set aside on a plate.',
      'In the same skillet, add the chicken broth, heavy cream, garlic powder, and Italian seasoning. Bring to a simmer over medium heat.',
      'Stir in the sun-dried tomatoes and Parmesan cheese. Let the sauce simmer for 2-3 minutes until it starts to thicken.',
      'Add the spinach and allow it to wilt in the sauce.',
      'Return the chicken to the skillet, spoon sauce over the chicken, and simmer for another 2 minutes before serving.'
    ]
  },
  {
    id: '3',
    title: 'Vegan Avocado Toast',
    description: 'Crispy sourdough bread topped with creamy mashed avocado, cherry tomatoes, microgreens, and a sprinkle of chili flakes.',
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=600',
    duration: 10,
    difficulty: 'Easy',
    calories: 210,
    rating: 4.7,
    reviewsCount: 89,
    chefName: 'Chef Sarah Green',
    chefAvatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=150',
    category: 'Breakfast',
    ingredients: [
      '2 slices sourdough or whole grain bread',
      '1 ripe Haas avocado',
      '1/2 cup cherry tomatoes, quartered',
      '1 tsp extra virgin olive oil',
      '1/2 lemon (for juice)',
      'Chili flakes and sea salt to taste',
      'Fresh microgreens or cilantro for garnish'
    ],
    instructions: [
      'Toast your bread slices to your desired level of crispiness.',
      'In a small bowl, mash the avocado with lemon juice, a drizzle of olive oil, salt, and pepper.',
      'Spread the mashed avocado evenly over the toasted bread slices.',
      'Top with quartered cherry tomatoes and microgreens.',
      'Garnish with a pinch of red chili flakes and flaky sea salt before serving.'
    ]
  },
  {
    id: '4',
    title: 'Spicy Beef Tacos',
    description: 'Perfectly seasoned ground beef served in warm tortillas, topped with shredded cheddar, fresh salsa, guacamole, and a drizzle of lime cream.',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=600',
    duration: 20,
    difficulty: 'Easy',
    calories: 380,
    rating: 4.6,
    reviewsCount: 215,
    chefName: 'Chef Mateo',
    chefAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
    category: 'Mexican',
    ingredients: [
      '1 lb lean ground beef',
      '1 packet taco seasoning (or chili powder, cumin, oregano mix)',
      '8 small corn or flour tortillas',
      '1 cup shredded cheddar cheese',
      '1 cup iceberg lettuce, shredded',
      '1/2 cup fresh pico de gallo or salsa',
      '1/2 cup sour cream mixed with lime juice',
      'Fresh cilantro and lime wedges'
    ],
    instructions: [
      'Brown the ground beef in a skillet over medium-high heat. Drain excess fat.',
      'Stir in the taco seasoning and water according to package directions (usually 1/3 cup). Simmer for 5 minutes until liquid is absorbed.',
      'Warm the tortillas in a dry skillet or microwave.',
      'Assemble tacos by layering beef, lettuce, cheese, and salsa inside warm tortillas.',
      'Top with lime-infused sour cream and fresh cilantro. Serve with lime wedges.'
    ]
  },
  {
    id: '5',
    title: 'Molten Chocolate Lava Cake',
    description: 'Decadent chocolate cakes with a rich, molten chocolate center. Served warm with a dusting of powdered sugar and vanilla ice cream.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600',
    duration: 25,
    difficulty: 'Hard',
    calories: 490,
    rating: 5.0,
    reviewsCount: 412,
    chefName: 'Chef Marcus',
    chefAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    category: 'Desserts',
    ingredients: [
      '4 oz high-quality semi-sweet chocolate, chopped',
      '1/2 cup unsalted butter',
      '2 whole eggs + 2 egg yolks',
      '1/4 cup sugar',
      '1/8 tsp salt',
      '2 tbsp all-purpose flour',
      'Powdered sugar and fresh berries for serving'
    ],
    instructions: [
      'Preheat oven to 425°F (218°C). Grease 4 ramekins with butter and dust with cocoa powder or flour.',
      'Melt the chopped chocolate and butter together in a heatproof bowl in 30-second increments in the microwave, stirring until smooth.',
      'In a separate bowl, whisk the whole eggs, egg yolks, sugar, and salt together until thick and pale.',
      'Gently fold the melted chocolate mixture and the flour into the egg mixture until just combined.',
      'Divide batter evenly among the prepared ramekins.',
      'Bake for 12-14 minutes until the edges are firm but the centers still jiggle slightly.',
      'Let cool for 1 minute, invert onto dessert plates, dust with powdered sugar, and serve immediately.'
    ]
  },
  {
    id: '6',
    title: 'Iced Matcha Green Tea Latte',
    description: 'Ceremonial grade matcha whisked with warm water, sweetened with honey, and poured over ice with creamy oat milk.',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600',
    duration: 5,
    difficulty: 'Easy',
    calories: 120,
    rating: 4.8,
    reviewsCount: 95,
    chefName: 'Chef Yuki',
    chefAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    category: 'Drinks',
    ingredients: [
      '1.5 tsp ceremonial grade matcha powder',
      '2 tbsp warm water (not boiling)',
      '1 tbsp honey or maple syrup',
      '1 cup oat milk (or milk of choice)',
      '1 cup ice cubes'
    ],
    instructions: [
      'Sift the matcha powder into a small bowl or mug to remove lumps.',
      'Add the warm water and whisk vigorously in a "W" shape using a bamboo whisk (or small hand frother) until frothy.',
      'Stir in the honey or maple syrup until fully dissolved.',
      'Fill a tall glass with ice and pour in the milk.',
      'Slowly pour the whisked matcha on top to create a beautiful layered effect. Stir before drinking.'
    ]
  }
];
