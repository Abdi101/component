const template = document.createElement("template");
template.innerHTML = `
<style>
@import "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css";

.add_joke {
    background-color: var(--background);
}
[select] {
    background-color: var(--primary-color);
}
[select]:hover {
    background-color: var(--hover-color) !important;
}
[select]:active, [select]:focus {
    background-color: var(--active-color) !important;
}

</style>

<section class="container add_joke p-5 mt-5">
        
<div class="row p-2">
    <p class="text-center text-white text-lg" joke></p>
</div>

<div class="row">
    <button class="btn-secondary btn-sm mb-2" refresh>REFRESH</button>
    <button class="btn btn-primary btn-sm border-0" select>ADD TO FAVOURITES</button>
</div>
</section>
`;

class JokeGenerator extends HTMLElement {
  constructor() {
    super();
    this.refresh = this.refresh.bind(this);
    this.select = this.select.bind(this);
    this.fetchNewJoke = this.fetchNewJoke.bind(this);

    this.attachShadow({ mode: "open" });
    this.joke = "";
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.displayJoke = this.shadowRoot.querySelector("[joke]");
    this.refreshBtn = this.shadowRoot.querySelector("[refresh]");
    this.selectBtn = this.shadowRoot.querySelector("[select]");
  }

  connectedCallback() {
    this.fetchNewJoke().then((joke) => {
      this.joke = joke;
    });

    this.refreshBtn.addEventListener("click", this.refresh);
    this.selectBtn.addEventListener("click", this.select);

    if (!this.hasAttribute("joke")) {
      this.setAttribute("joke", "");
    }
  }

  refresh() {
    this.fetchNewJoke().then((newJoke) => {
      this.joke = newJoke;
      this.selectBtn.disabled = false;
    });
  }

  select() {
    this.selectBtn.disabled = true;
    this.dispatchEvent(
      new CustomEvent("joke-selected", {
        bubbles: true,
        detail: {
          joke: this.joke,
        },
      })
    );
  }

  fetchNewJoke() {
    return new Promise((resolve, reject) => {
      fetch("https://api.chucknorris.io/jokes/random")
        .then((response) => response.json())
        .then((data) => {
          resolve(data.value);
        })
        .catch((err) => reject(err));
    });
  }

  static get observedAttributes() {
    return ["joke"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.displayJoke.innerText = this.joke;
  }

  get joke() {
    return this.getAttribute("joke");
  }
  set joke(newValue) {
    this.setAttribute("joke", newValue);
  }

  disconnectedCallback() {
    this.refreshBtn.removeEventListener("click", this.refresh);
    this.selectBtn.removeEventListener("click", this.select);
  }
}

window.customElements.define("joke-generator", JokeGenerator);
