document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("product-form");
    const productTableBody = document.querySelector("#product-table tbody");
    const ivaTotalElement = document.getElementById("iva-total");
    const grandTotalElement = document.getElementById("grand-total");
    const generateCsvButton = document.getElementById("generate-csv");

    let products = [];

    // Manejar el envío del formulario para agregar un producto
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("product-name").value;
        const price = parseFloat(document.getElementById("product-price").value);
        const quantity = parseInt(document.getElementById("product-quantity").value);

        // Hacer una solicitud POST al backend para agregar el producto a la base de datos
        fetch('http://localhost:8080/add-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, price, quantity })
        })
        .then(response => {
            if (response.ok) {
                // Si la respuesta es exitosa, agregar el producto al array y actualizar la tabla
                products.push({ name, price, quantity });
                updateTable();
                form.reset();
            } else {
                alert("Error al agregar el producto.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Hubo un problema con la conexión al servidor.");
        });
    });

    // Actualizar la tabla con los productos
    function updateTable() {
        productTableBody.innerHTML = ""; // Limpiar la tabla
        let iva = 0;
        let grandTotal = 0;

        products.forEach((product, index) => {
            const subtotal = product.price * product.quantity;
            iva += subtotal * 0.16;
            grandTotal += subtotal + subtotal * 0.16;

            // Crear una nueva fila para el producto
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.name}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.quantity}</td>
                <td>$${subtotal.toFixed(2)}</td>
            `;
            productTableBody.appendChild(row);
        });

        // Actualizar los totales
        ivaTotalElement.textContent = iva.toFixed(2);
        grandTotalElement.textContent = grandTotal.toFixed(2);
    }

    // Generar un archivo CSV
    generateCsvButton.addEventListener("click", () => {
        const buyerName = prompt("Ingrese su nombre:");
        if (!buyerName) return;

        const date = new Date().toLocaleString();
        let csvContent = `Comprador:,${buyerName}\n`;
        csvContent += `Fecha:,${date}\n\n`;
        csvContent += `Producto,Cantidad,Precio Unitario,Subtotal\n`;

        products.forEach((product) => {
            const subtotal = product.price * product.quantity;
            csvContent += `${product.name},${product.quantity},${product.price.toFixed(2)},${subtotal.toFixed(2)}\n`;
        });

        const iva = parseFloat(ivaTotalElement.textContent);
        const grandTotal = parseFloat(grandTotalElement.textContent);

        csvContent += `\nIVA (16%),,,$${iva.toFixed(2)}\n`;
        csvContent += `Total,,,$${grandTotal.toFixed(2)}\n`;

        const blob = new Blob([csvContent], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "ticket.csv";
        link.click();
    });
});

