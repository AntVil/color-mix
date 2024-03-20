let colorMixer;

window.onload = () => {
    let headerElement = document.getElementsByTagName("header")[0];

    colorMixer = new ColorMixer(
        headerElement,
        [
            [255, 0, 0],
            [255, 128, 0],
            [255, 255, 0],
            [0, 255, 0],
            [0, 255, 255],
            [0, 0, 255],
            [255, 0, 255],
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

        let startIndex = undefined;
        for(let i=0;i<this.parts.length;i++) {
            if(this.parts[i] != 0) {
                startIndex = i;
                break;
            }
        }

        let currentR = this.colors[startIndex][0];
        let currentG = this.colors[startIndex][1];
        let currentB = this.colors[startIndex][2];
        let currentParts = this.parts[startIndex];

        for(let i=startIndex+1;i<this.parts.length;i++) {
            if(this.parts[i] === 0) {
                continue;
            }

            let currentPartTotal = currentParts + this.parts[i];
            [currentR, currentG, currentB] = this.mix(
                [currentR, currentG, currentB],
                this.colors[i],
                this.parts[i] / currentPartTotal
            );

            currentParts = currentPartTotal;
        }

        currentR = Math.round(currentR);
        currentG = Math.round(currentG);
        currentB = Math.round(currentB);

        let isBright = this.isPerceivedBright(currentR, currentG, currentB);
        let color = this.getHex(currentR, currentG, currentB);

        document.documentElement.style.setProperty("--result-color", color);
        let identifierElement = document.getElementById("result-identifier");
        identifierElement.innerText = color;
        identifierElement.style.color = isBright ? "var(--theme-color-1)" : "var(--theme-color-0)";
    }

    mix(color1, color2, fraction) {
        let x0 = color1[0];
        let x1 = color1[1];
        let x2 = color1[2];
        let x3 = color2[0];
        let x4 = color2[1];
        let x5 = color2[2];
        let x6 = 1 - fraction;

        // fails for white and black
        // sometimes fails for fraction != 0.5
        //let r = ((x0 * x6) + (Math.cos(x6 * 1.6116096) * (x3 + (x6 * -180.75304))));
        let g = (((Math.sin(-1.726646 * x6) + 0.9927672) * x4) + (x1 * x6));
        let b = (((x2 * x6) + x5) + (x5 * Math.sin(x6 * -1.620506)));

        //let r = ((((x0 + (155.0158 * x6)) + ((-0.9843842 * x3) + -156.97112)) * x6) + x3);
        let r = ((Math.cos(Math.sin(x6 * -1.4661) * 7.9007) * (x3 + (x6 * -165.09))) + ((x0 * x6) + Math.sin(x4)))

        r = Math.max(Math.min(r, 255), 0);
        g = Math.max(Math.min(g, 255), 0);
        b = Math.max(Math.min(b, 255), 0);

        return [r, g, b];
    }

    reset() {
        this.parts = this.colors.map(() => 0);
        this.render();
    }
}
