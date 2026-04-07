// Test the Post API endpoint
// Run this in your browser console or use it as a reference for your mobile app

// Test 1: Create Post
async function testCreatePost() {
  const payload = {
    userId: "64f5e2a1c1a2b3c4d5e6f7g7", // Replace with your actual user ID
    city: "Mumbai",
    state: "Maharashtra",
    pin: "400001",
    address: "Near Gateway of India, apartment complex",
    requiredSkills: ["Electrician", "Plumber"],
    expectedPrice: 5000,
    stayAvailable: true,
    foodAvailable: true,
    workPhotos: [
      "https://via.placeholder.com/300x300?text=Photo+1",
      "https://via.placeholder.com/300x300?text=Photo+2"
    ]
  };

  console.log('Sending payload:', payload);

  try {
    const response = await fetch('http://localhost:5000/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (data.success) {
      console.log('✓ Post created successfully!');
      console.log('Post ID:', data.data._id);
      return data.data._id;
    } else {
      console.error('✗ Error:', data.message);
      if (data.debug) {
        console.error('Debug info:', data.debug);
      }
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Test 2: Get All Posts
async function testGetAllPosts() {
  try {
    const response = await fetch('http://localhost:5000/api/posts?city=Mumbai&limit=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Get Posts Response:', data);
    return data.data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test 3: Get Single Post
async function testGetPost(postId) {
  try {
    const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Get Single Post Response:', data);
    return data.data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test 4: Update Post
async function testUpdatePost(postId) {
  const payload = {
    userId: "64f5e2a1c1a2b3c4d5e6f7g7", // Must match the post creator
    expectedPrice: 6000,
    stayAvailable: false
  };

  try {
    const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Update Post Response:', data);
    return data.data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test 5: Apply for Post
async function testApplyForPost(postId) {
  const payload = {
    workerId: "64f5e4d4e1a2b3c4d5e6f7g0" // Replace with actual worker ID
  };

  try {
    const response = await fetch(`http://localhost:5000/api/posts/${postId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Apply for Post Response:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run tests
console.log('=== Testing Post API ===\n');
console.log('1. Creating new post...');
// testCreatePost().then(postId => {
//   if (postId) {
//     console.log('\n2. Getting all posts...');
//     testGetAllPosts();
//     console.log('\n3. Getting single post...');
//     testGetPost(postId);
//   }
// });

// Uncomment the line above and run testCreatePost() to test the API
