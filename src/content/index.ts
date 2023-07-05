async function initialize() {
  console.log("CONTENTS");
  const t = document.createElement("style");
  t.id = "BLOCKoli";
  t.textContent = `
    body {
    }
    `;
  document.head.appendChild(t);
}
initialize();
console.log("CONTENTS2");

document.body.appendChild(document.createElement("div"));
