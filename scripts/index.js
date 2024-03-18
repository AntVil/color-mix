let colorMixer;

window.onload = () => {
    let headerElement = document.getElementsByTagName("header")[0];

    colorMixer = new ColorMixer(
        headerElement,
        [
            [255, 0, 0],
            [255, 255, 0],
            [0, 0, 255],
            [0, 0, 0],
            [255, 255, 255],
        ]
    );
}

function reset() {
    colorMixer.reset();
}

class ColorMixer {
    constructor(headerElement, colors) {
        this.headerElement = headerElement;
        this.colors = [];
        this.parts = [];
        this.partsElements = [];

        let elements = colors.map(color => this.newElement(color));

        headerElement.replaceChildren(...elements);
    }

    newElement(color) {
        let index = this.colors.length;
        this.colors.push(color);
        this.parts.push(0);

        let container = document.createElement("div");
        let addButton = document.createElement("button");
        let removeButton = document.createElement("button");
        let identifierElement = document.createElement("div");

        let hex = this.getHex(...color);
        identifierElement.innerText = hex;

        this.partsElements.push(addButton);

        addButton.setAttribute("data-parts", "0");
        addButton.setAttribute("data-percent", "0");
        addButton.style.backgroundColor = hex;

        // accessibility
        addButton.setAttribute("aria-label", `add ${hex}`);
        removeButton.setAttribute("aria-label", `remove ${hex}`);
        let isBright = this.isPerceivedBright(...color);
        addButton.style.color = isBright ? "var(--theme-color-1)" : "var(--theme-color-0)";

        container.appendChild(addButton);
        container.appendChild(identifierElement);
        container.appendChild(removeButton);

        addButton.onclick = () => {
            this.parts[index]++;
            this.render();
        }
        removeButton.onclick = () => {
            this.parts[index] = Math.max(this.parts[index] - 1, 0);
            this.render();
        }

        return container;
    }

    getHex(r, g, b) {
        let rHex = r.toString(16).toUpperCase().padStart(2, "0");
        let gHex = g.toString(16).toUpperCase().padStart(2, "0");
        let bHex = b.toString(16).toUpperCase().padStart(2, "0");
        return `#${rHex}${gHex}${bHex}`;
    }

    isPerceivedBright(r, g, b) {
        return Math.round(((parseInt(r) * 299) + (parseInt(g) * 587) + (parseInt(b) * 114)) / 1000) > 125;
    }

    render() {
        let totalParts = this.parts.reduce((a, b) => a + b, 0);

        for (let i = 0; i < this.parts.length; i++) {
            let percent = (100 * this.parts[i] / totalParts).toFixed(1);
            this.partsElements[i].setAttribute("data-parts", this.parts[i]);
            this.partsElements[i].setAttribute("data-percent", percent);
        }

        if (totalParts === 0) {
            document.documentElement.style.setProperty("--result-color", "transparent");
            document.getElementById("result-identifier").innerText = "";
            return
        }

        let rTotal = 0;
        let gTotal = 0;
        let bTotal = 0;

        for (let i = 0; i < this.parts.length; i++) {
            rTotal += this.parts[i] * this.colors[i][0];
            gTotal += this.parts[i] * this.colors[i][1];
            bTotal += this.parts[i] * this.colors[i][2];
        }

        rTotal = Math.round(rTotal / totalParts);
        gTotal = Math.round(gTotal / totalParts);
        bTotal = Math.round(bTotal / totalParts);

        let isBright = this.isPerceivedBright(rTotal, gTotal, bTotal);
        let color = this.getHex(rTotal, gTotal, bTotal);

        document.documentElement.style.setProperty("--result-color", color);
        let identifierElement = document.getElementById("result-identifier");
        identifierElement.innerText = color;
        identifierElement.style.color = isBright ? "var(--theme-color-1)" : "var(--theme-color-0)";
    }

    reset() {
        this.parts = this.colors.map(() => 0);
        this.render();
    }
}
