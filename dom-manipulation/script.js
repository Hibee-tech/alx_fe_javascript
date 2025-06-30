// Array to store quote objects
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Reflection" },
  { text: "It's not whether you get knocked down, it's whether you get up.", category: "Perseverance" }
];

// Function to show a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quote-display");
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${text}"</p><small>— ${category}</small>`;
}

// Function to create and append a form for adding quotes
function createAddQuoteForm() {
  const formContainer = document.getElementById("form-container");

  // Clear any existing form
  formContainer.innerHTML = "";

  const form = document.createElement("form");
  form.id = "add-quote-form";

  const quoteLabel = document.createElement("label");
  quoteLabel.textContent = "Quote:";
  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.required = true;

  const categoryLabel = document.createElement("label");
  categoryLabel.textContent = "Category:";
  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.required = true;

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Add Quote";

  form.append(quoteLabel, quoteInput, document.createElement("br"),
              categoryLabel, categoryInput, document.createElement("br"),
              submitBtn);

  formContainer.appendChild(form);

  // Add event listener to handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newQuote = quoteInput.value.trim();
    const newCategory = categoryInput.value.trim();

    if (newQuote && newCategory) {
      quotes.push({ text: newQuote, category: newCategory });
      alert("Quote added!");
      quoteInput.value = "";
      categoryInput.value = "";
    } else {
      alert("Please fill out both fields.");
    }
  });
}

// Attach functions to buttons once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("random-btn").addEventListener("click", showRandomQuote);
  document.getElementById("add-quote-btn").addEventListener("click", createAddQuoteForm);
});



let quotes = [];

// Load saved quotes from localStorage
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) quotes = JSON.parse(stored);
}

// Save current quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show notification in UI
function showNotification(message, type = 'success') {
  const note = document.getElementById('notification');
  note.textContent = message;
  note.className = `notification ${type}`;
  note.style.opacity = '1';
  setTimeout(() => {
    note.style.opacity = '0';
  }, 4000);
}

// Populate dropdown with unique categories
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const selected = localStorage.getItem('selectedCategory') || 'all';

  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  categoryFilter.value = selected;
}

// Display a filtered quote based on the selected category
function filterQuotes() {
  const selected = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', selected);

  const filtered = selected === 'all'
    ? quotes
    : quotes.filter(q => q.category === selected);

  const display = document.getElementById('quoteDisplay');
  display.className = 'quote-box';

  if (filtered.length === 0) {
    display.innerHTML = `<p>No quotes found for selected category.</p>`;
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  display.innerHTML = `<blockquote>${random.text}</blockquote><p>— ${random.category}</p>`;

  sessionStorage.setItem('lastViewedQuote', JSON.stringify(random));
}

// Add a new quote and update category dropdown
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) return alert("Please enter both quote and category.");

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  // Post to server (mock)
  postQuoteToServer(newQuote);

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

// JSON Export
document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
});

// JSON Import
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const imported = JSON.parse(e.target.result);
    quotes.push(...imported);
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification('Quotes imported successfully!', 'success');
  };
  reader.readAsText(event.target.files[0]);
}

// ✅ Mock API GET - Fetch quotes from required endpoint
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();
    return data.map(post => ({
      text: post.title,
      category: post.body
    }));
  } catch (error) {
    console.error('Failed to fetch from server:', error);
    showNotification('Error fetching from server!', 'error');
    return [];
  }
}

// ✅ Mock API POST - Push new quote to mock API
async function postQuoteToServer(quote) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: quote.text,
        body: quote.category,
        userId: 1
      })
    });
    const result = await response.json();
    console.log('Quote posted to mock API:', result);
  } catch (error) {
    console.error('Failed to post quote:', error);
    showNotification('Failed to post quote to server.', 'error');
  }
}

// ✅ Merge quotes and update UI
function mergeServerQuotes(serverQuotes) {
  const localMap = new Map(quotes.map(q => [q.text, q]));
  let newCount = 0;

  serverQuotes.forEach(serverQuote => {
    if (!localMap.has(serverQuote.text)) {
      quotes.push(serverQuote);
      newCount++;
    }
  });

  if (newCount > 0) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification(`Quotes synced with server! ${newCount} new quote(s) added.`, 'success');
  } else {
    showNotification('Quotes synced with server! No new quotes found.', 'success');
  }
}

// ✅ Main sync function
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  mergeServerQuotes(serverQuotes);
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById('newQuote').addEventListener('click', filterQuotes);
  document.getElementById('addQuoteBtn').addEventListener('click', addQuote);

  // Initial and periodic sync
  syncQuotes();
  setInterval(syncQuotes, 60000);
});
