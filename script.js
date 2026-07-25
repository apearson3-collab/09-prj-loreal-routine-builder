const selectedNames = [];
const selectedBrands = [];
const selectedDescription = [];

const conversation = [
  {
    role: "system",
    content: `You are an answer machine for the company L'Oréal and you will receive a questions from customers about L'Oréal, their products, and or routines and do your best to help to guide them on what they want to know. You can also give recommendations to further help them; you may also be given a list of products for which you will help create routines, addtionally you should decline any questions which do not pretain to those topics.`,
  },
];
/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");
const descriptionDisplay = document.getElementById("description");
const close = document.getElementsByClassName("close")[0];
const genarateButton = document.getElementById("generateRoutine");
const userInput = document.getElementById("userInput");

load();
console.log(selectedNames);
/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
        <p class="description">${product.description}</p>
      </div>
    </div>
  `,
    )
    .join("");

  var productCards = document.getElementsByClassName("product-card");
  for (var i = 0; i < productCards.length; i++) {
    for (var j = 0; j < selectedNames.length; j++) {
      if (
        productCards[i].children[1].children[0].innerText == selectedNames[j]
      ) {
        selectedNames.splice(j, 1);
        selectedNames.push(productCards[i].children[1].children[0].innerText);
        selectedBrands.splice(j, 1);
        selectedBrands.push(productCards[i].children[1].children[1].innerText);
        selectedDescription.splice(j, 1);
        selectedDescription.push(
          productCards[i].children[1].children[2].innerText,
        );
        save();
        productCards[i].classList.toggle("selected");
        break;
      }
    }
    productCards[i].addEventListener(
      "click",
      function () {
        var index = selectedNames.indexOf(
          this.children[1].children[0].innerText,
        );
        if (index > -1) {
          selectedNames.splice(index, 1);
          selectedBrands.splice(index, 1);
          selectedDescription.splice(index, 1);
          save();
        } else {
          selectedNames.push(this.children[1].children[0].innerText);
          selectedBrands.push(this.children[1].children[1].innerText);
          selectedDescription.push(this.children[1].children[2].innerText);
          save();
          displayModel(this.children[1].children[2].innerText);
        }
        this.classList.toggle("selected");
        selectedProductsList.innerHTML = "";
        for (var j = 0; j < selectedNames.length; j++) {
          const text = document.createElement("p");

          text.innerText = selectedNames[j];
          selectedProductsList.append(text);
          text.addEventListener("click", function () {
            removeSelected(this);
          });
        }
      },
      false,
    );
  }
}

function removeSelected(text) {
  for (var i = 0; i < selectedNames.length; i++) {
    if (text.innerText == selectedNames[i]) {
      selectedNames.splice(i, 1);
      selectedBrands.splice(i, 1);
      selectedDescription.splice(i, 1);
      save();
    }
  }
  text.remove();
  for (var i = 0; i < productsContainer.children.length; i++) {
    if (
      selectedNames.indexOf(
        productsContainer.children[i].children[1].children[0].innerText,
      ) == -1
    ) {
      productsContainer.children[i].classList.remove("selected");
    }
  }
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory,
  );

  displayProducts(filteredProducts);
});

/* Chat form submission handler - placeholder for OpenAI integration */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  conversation.push({
    role: "user",
    content: userInput.value,
  });

  const response = await fetch("https://bold-king-7ccd.apearson3.workers.dev", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "",
      messages: conversation,
    }),
  });
  const result = await response.json();
  conversation.push({
    role: "assistant",
    content: result.choices[0].message.content,
  });

  chatWindow.innerHTML = result.choices[0].message.content;
});

function displayModel(description) {
  modal.style.display = "block";
  descriptionDisplay.innerText = description;
}

close.onclick = function (description) {
  modal.style.display = "none";
};

genarateButton.addEventListener("click", async (e) => {
  chatWindow.innerHTML = "waiting for response";
  const products = await loadProducts();
  const names = [];
  for (var i = 0; i < selectedProductsList.children.length; i++) {
    names.push(selectedProductsList.children[i].innerText);
  }
  const selectedProducts = products.filter(
    (product) => names.indexOf(product.name) > -1,
  );
  var message = "";
  for (var i = 0; i < selectedProducts.length; i++) {
    message +=
      "Product " +
      (i + 1) +
      " name: " +
      selectedProducts[i].name +
      ", Brand: " +
      selectedProducts[i].brand +
      ", Category: " +
      selectedProducts[i].category +
      ", Description: " +
      selectedProducts[i].description +
      " ";
  }
  conversation.push({
    role: "user",
    content: "here is the list of products the user has selected " + message,
  });
  const response = await fetch("https://bold-king-7ccd.apearson3.workers.dev", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "",
      messages: conversation,
    }),
  });
  const result = await response.json();
  conversation.push({
    role: "assistant",
    content: result.choices[0].message.content,
  });

  chatWindow.innerHTML = result.choices[0].message.content;
});

function save() {
  localStorage.setItem("selectedNames", JSON.stringify(selectedNames));
  localStorage.setItem("selectedBrands", JSON.stringify(selectedBrands));
  localStorage.setItem(
    "selectedDescription",
    JSON.stringify(selectedDescription),
  );
}

function load() {
  const storedNames = JSON.parse(localStorage.getItem("selectedNames"));
  const storedBrands = JSON.parse(localStorage.getItem("selectedBrands"));
  const storedDescription = JSON.parse(
    localStorage.getItem("selectedDescription"),
  );
  if (storedNames) {
    for (let i = 0; i < storedNames.length; i++) {
      selectedNames.push(storedNames[i]);
      selectedBrands.push(storedBrands[i]);
      selectedDescription.push(storedDescription[i]);
    }

    for (var j = 0; j < selectedNames.length; j++) {
      const text = document.createElement("p");
      text.innerText = selectedNames[j];
      selectedProductsList.append(text);
      text.addEventListener("click", function () {
        removeSelected(this);
      });
    }
  }
}
