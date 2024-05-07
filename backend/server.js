const express = require('express');
const bodyParser = require('body-parser');
const mssql = require('mssql/msnodesqlv8');
const cors = require('cors');
const app = express();
const sql = require('mssql');
const { Int } = require('msnodesqlv8');
app.use(bodyParser.json());
app.use(cors());
const config = {
  server: 'localhost',
  user: 'burhan',
  password: '',
  database: 'ECOMMERCE',
  options: {
    trustServerCertificate: true,
  }
};
let cart = [];
let signedUserId = null;
sql.connect(config).then(pool => {
  return pool.query('SELECT * FROM Product');
}).then(result => {
  console.log(result.recordset);
}).catch(err => {
  console.error('Error:', err);
});
//......................SignUp API
app.post("/api/signup", async (req, res) => {
  try {
    const formData = req.body;
    console.log("Received form data:", formData);

    // Connect to the database
    await sql.connect(config);
    console.log("Connected to DataBase");

    // Check Existing User
    const checkUsernameQuery = `SELECT COUNT(*) AS count FROM [User] WHERE UserName = @userName`;
    const checkUsernameRequest = new sql.Request();
    checkUsernameRequest.input('userName', sql.VarChar, formData.username);
    const checkUsernameResult = await checkUsernameRequest.query(checkUsernameQuery);
    const existingUserCount = checkUsernameResult.recordset[0].count;
    if (existingUserCount > 0) {
      // User with the same username already exists
      return res.status(400).json({ error: 'User with similar username already exists' });
    }

    // Query to insert data in User Table
    const insertUserQuery = `INSERT INTO [User] (FirstName, LastName, UserName, Email, Password, PhoneNumber, RegistrationDate, Role, Age, Gender)
                             VALUES (@firstName, @lastName, @userName, @email, @password,
                                     @phoneNumber, @registrationDate, @role, @age, @gender) `;
    const insertUserRequest = new sql.Request();
    insertUserRequest.input('firstName', sql.VarChar, formData.firstname);
    insertUserRequest.input('lastName', sql.VarChar, formData.lastname);
    insertUserRequest.input('userName', sql.VarChar, formData.username);
    insertUserRequest.input('email', sql.VarChar, formData.email);
    insertUserRequest.input('password', sql.VarChar, formData.password);
    insertUserRequest.input('phoneNumber', sql.VarChar, formData.phoneNumber);
    insertUserRequest.input('registrationDate', sql.VarChar, formData.registrationDate);
    insertUserRequest.input('role', sql.VarChar, formData.role);
    insertUserRequest.input('age', sql.VarChar, formData.age);
    insertUserRequest.input('gender', sql.VarChar, formData.gender);
    // Execute the insert query for User
    const insertUserResult = await insertUserRequest.query(insertUserQuery);
    console.log("User data inserted successfully");

    // Fetch the UserId of the inserted User
    const selectUserQuery = `SELECT * FROM [User] WHERE UserName = @userName`;
    const selectUserRequest = new sql.Request();
    selectUserRequest.input('userName', sql.VarChar, formData.username);
    const selectUserResult = await selectUserRequest.query(selectUserQuery);
    const userId = selectUserResult.recordset[0].UserId;
    console.log("User data retrieved:", userId);
    if (formData.role === 'Customer') {
      // Insert into Customer table
      const insertCustomerQuery = `INSERT INTO [Customer] (UserId, LoyaltyPoints)
                               VALUES (@userId, 10)`;
      const insertCustomerRequest = new sql.Request();
      insertCustomerRequest.input('userId', sql.Int, userId);
      const insertCustomerResult = await insertCustomerRequest.query(insertCustomerQuery);
      console.log("Data inserted into Customer");
    } else if (formData.role === 'Admin') {
      // Insert into Admin table
      const insertAdminQuery = `INSERT INTO [Admin] (UserId, IsActive)
                            VALUES (@userId, 1)`;
      const insertAdminRequest = new sql.Request();
      insertAdminRequest.input('userId', sql.Int, userId);
      const insertAdminResult = await insertAdminRequest.query(insertAdminQuery);
      console.log("Data inserted into Admin");
    } else {
      // Handle other roles or invalid role values
    }

    await sql.close();
    res.status(200).send("Form data received and inserted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send("Error inserting data");
  }
});
//........................ SignIn API
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    await sql.connect(config);
    console.log("Connected to DataBase");
    const loginQuery = `SELECT * FROM [User] WHERE Email = @email AND Password = @password`;
    const loginRequest = new sql.Request();
    loginRequest.input('email', sql.VarChar, email);
    loginRequest.input('password', sql.VarChar, password);
    const loginResult = await loginRequest.query(loginQuery);
    if (loginResult.recordset.length > 0) {
      signedUserId = loginResult.recordset[0].UserId;
      console.log(signedUserId);
      console.log("res send1");
      res.status(200).json({ message: 'Login successful', user: loginResult.recordset[0] });
    } else {
      console.log("res send2");
      signedUserId = loginResult.recordset[0].UserId;
      res.status(401).json({ error: 'Invalid credentials' });
    }

    await sql.close();
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).send("Error logging in");
  }
});
//......................................Add Product API
app.post("/api/addproduct", async (req, res) => {
  try {
    const formData = req.body;
    console.log("Received form data:", formData);

    // Connect to the database
    await sql.connect(config);
    console.log("Connected to DataBase");

    // Start a transaction to ensure atomicity of both inserts
    const transaction = new sql.Transaction();
    await transaction.begin();

    try {
      // Query to insert data in Product Table and retrieve the newly inserted ProductId
      const insertProductQuery = `
        INSERT INTO [Product] (Name, BrandName, ImageUrl, Price)
        VALUES (@productname, @brand, @image, @price);
        SELECT SCOPE_IDENTITY() AS ProductId; -- Retrieve the newly inserted ProductId
      `;

      const insertProductRequest = new sql.Request(transaction);
      insertProductRequest.input('productname', sql.VarChar, formData.productname);
      insertProductRequest.input('brand', sql.VarChar, formData.description);
      insertProductRequest.input('price', sql.VarChar, formData.price);
      insertProductRequest.input('image', sql.VarChar, formData.image);

      // Execute the insert query for Product and retrieve the ProductId
      const insertProductResult = await insertProductRequest.query(insertProductQuery);
      const productId = insertProductResult.recordset[0].ProductId; // Extract ProductId from the result

      console.log("Product inserted successfully. ProductId:", productId);

      // Query to insert data in Stock Table
      const insertStockQuery = `
        INSERT INTO [Stock] (ProductId, Quantity, CostPrice, StockStatus)
        VALUES (@productId, @quantity, @cost, '1');
      `;

      const insertStockRequest = new sql.Request(transaction);
      insertStockRequest.input('productId', sql.Int, productId);
      insertStockRequest.input('quantity', sql.Int, formData.stock); // Assuming quantity is provided in the form data
      insertStockRequest.input('cost', sql.Int, formData.price); // Assuming quantity is provided in the form data

      // Execute the insert query for Stock
      await insertStockRequest.query(insertStockQuery);

      //......................Query to Insert Category
      const insertCategoryQuery = `
      INSERT INTO [ProductCategory] (ProductId, CategoryId, IsPrimary)
      VALUES (@productId, @categoryid, '1');
    `;

      const insertCategoryRequest = new sql.Request(transaction);
      insertCategoryRequest.input('productId', sql.Int, productId);
      insertCategoryRequest.input('categoryid', sql.Int, formData.category); // Assuming quantity is provided in the form data

      // Execute the insert query for Stock
      await insertCategoryRequest.query(insertCategoryQuery);

      // Commit the transaction if both inserts succeed
      await transaction.commit();

      await sql.close();
      res.status(200).send({ message: "Product and stock data added successfully", productId });
    } catch (err) {
      // Rollback the transaction if an error occurs
      await transaction.rollback();
      console.error("Error inserting data:", err);
      res.status(500).send("Error inserting data");
    }
  } catch (err) {
    console.error("Error connecting to database:", err);
    res.status(500).send("Error connecting to database");
  }
});

//....................View Products API
app.get('/api/viewproducts', async (req, res) => {
  try {
    // Connect to SQL Server
    await sql.connect(config);
    console.log("Connected to DataBase");
    const result = await sql.query`SELECT * FROM Product`;
    // Send products data as response
    res.json(result.recordset);
    console.log("Response Send");
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  } finally {
    await sql.close();
  }
});
//....................View Categories API
app.get('/api/viewcategories', async (req, res) => {
  try {
    // Connect to SQL Server
    await sql.connect(config);
    console.log("Connected to DataBase");
    const result = await sql.query`SELECT * FROM Category`;
    // Send products data as response
    res.json(result.recordset);
    console.log("Response Send");
  } catch (error) {
    console.error('Error fetching Categories:', error);
    res.status(500).json({ error: 'Error fetching Categories' });
  } finally {
    await sql.close();
  }
});
//....................View Reviews API
app.get('/api/viewreviews', async (req, res) => {
  try {
    // Connect to SQL Server
    await sql.connect(config);
    console.log("Connected to DataBase");
    const result = await sql.query`SELECT [User].FirstName,[User].LastName,Review.Rating,Review.Comment FROM Review join [User] on Review.UserId = [User].UserId`;
    // Send products data as response
    res.json(result.recordset);
    console.log("Response Send");
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  } finally {
    await sql.close();
  }
});

//....................View Shipping Methods API
app.get('/api/viewshippingmethods', async (req, res) => {
  try {
    // Connect to SQL Server
    await sql.connect(config);
    console.log("Connected to DataBase");
    const result = await sql.query`SELECT * FROM ShippingMethod`;
    // Send products data as response
    res.json(result.recordset);
    console.log("Response Send");
  } catch (error) {
    console.error('Error fetching Shipping methods:', error);
    res.status(500).json({ error: 'Error fetching Shipping methods' });
  } finally {
    await sql.close();
  }
});
//.....................Add Products to Cart API
app.post('/api/addtocart', (req, res) => {
  console.log("Enter Cart");
  const { addedProducts } = req.body;
  cart = [];
  if (Array.isArray(addedProducts)) {
    cart.push(...addedProducts);
    res.status(200).send('Products added to cart successfully.');
    console.log(cart);
  } else {
    res.status(400).send('Invalid request body.');
  }
});



//......................Get Cart Data API
app.get('/api/getcartdata', (req, res) => {
  res.status(200).json(cart);
});
//........................................TotalSales data API
// Checkout API with Sales Data Insertion
app.post("/api/totalsales", async (req, res) => {
  try {
    const cartData = req.body;
    console.log("Received cart data:", cartData);

    // Connect to the database
    await sql.connect(config);
    console.log("Connected to DataBase");

    // Start a transaction to ensure atomicity of all operations
    const transaction = new sql.Transaction();
    await transaction.begin();

    try {
      // Iterate through cart items and process each item
      for (const item of cartData.items) {
        const productId = item.productId;
        const soldStock = item.quantity; // Assuming quantity represents soldStock during checkout
        const totalSaleAmount = item.price * item.quantity; // Calculate total sale amount

        // Check if the product already exists in TotalSales
        const checkProductQuery = `
          SELECT * FROM TotalSales WHERE ProductId = @productId;
        `;
        const checkProductRequest = new sql.Request(transaction);
        checkProductRequest.input('productId', sql.Int, productId);
        const checkProductResult = await checkProductRequest.query(checkProductQuery);

        if (checkProductResult.recordset.length > 0) {
          // Product exists, update SoldStock and TotalSaleAmount
          const existingSoldStock = checkProductResult.recordset[0].SoldStock;
          const updatedSoldStock = existingSoldStock + soldStock;
          const existingTotalSaleAmount = checkProductResult.recordset[0].TotalSaleAmount;
          const updatedTotalSaleAmount = existingTotalSaleAmount + totalSaleAmount;

          // Update SoldStock and TotalSaleAmount in TotalSales table
          const updateSalesQuery = `
            UPDATE TotalSales SET SoldStock = @updatedSoldStock, TotalSaleAmount = @updatedTotalSaleAmount
            WHERE ProductId = @productId;
          `;
          const updateSalesRequest = new sql.Request(transaction);
          updateSalesRequest.input('productId', sql.Int, productId);
          updateSalesRequest.input('updatedSoldStock', sql.Int, updatedSoldStock);
          updateSalesRequest.input('updatedTotalSaleAmount', sql.Decimal, updatedTotalSaleAmount);
          await updateSalesRequest.query(updateSalesQuery);
        } else {
          // Product does not exist, insert into TotalSales
          const insertSalesQuery = `
            INSERT INTO TotalSales (ProductId, SoldStock, TotalSaleAmount, SaleDate)
            VALUES (@productId, @soldStock, @totalSaleAmount, GETDATE());
          `;
          const insertSalesRequest = new sql.Request(transaction);
          insertSalesRequest.input('productId', sql.Int, productId);
          insertSalesRequest.input('soldStock', sql.Int, soldStock);
          insertSalesRequest.input('totalSaleAmount', sql.Decimal, totalSaleAmount);
          await insertSalesRequest.query(insertSalesQuery);
        }
      }

      // Commit the transaction if all inserts and updates succeed
      await transaction.commit();

      await sql.close();
      res.status(200).send({ message: "Checkout successful. Sales data added/updated." });
    } catch (err) {
      // Rollback the transaction if an error occurs
      await transaction.rollback();
      console.error("Error inserting/updating sales data during checkout:", err);
      res.status(500).send("Error inserting/updating sales data during checkout");
    }
  } catch (err) {
    console.error("Error connecting to database during checkout:", err);
    res.status(500).send("Error connecting to database during checkout");
  }
});

//......................................CheckOut API
app.post('/api/checkout', async (req, res) => {
  console.log("Entered Address API");
  const formData = req.body;
  console.log("Received form data:", formData);
  try {
    // Connect to the database
    await sql.connect(config);
    console.log("Connected to DataBase");
    // Query to insert data in Address Table
    const insertQuery = `INSERT INTO [Address] (HouseNumber,StreetNumber,Area, City, State, Country,PostalCode)
                       VALUES (@housenumber,@streetnumber,@area, @city, @state, @country, @postalcode) `;
    const insertRequest = new sql.Request();
    insertRequest.input('housenumber', sql.VarChar, formData.housenumber);
    insertRequest.input('streetnumber', sql.VarChar, formData.streetnumber);
    insertRequest.input('area', sql.VarChar, formData.area);
    insertRequest.input('city', sql.VarChar, formData.city);
    insertRequest.input('state', sql.VarChar, formData.state);
    insertRequest.input('country', sql.VarChar, formData.country);
    insertRequest.input('postalcode', sql.VarChar, formData.postalcode);
    const insertResult = await insertRequest.query(insertQuery);
    console.log("Data inserted successfully in Address");

    // Query to select AddressId of the current inserted address
    const selectQuery = `SELECT AddressId
    FROM [Address]
    WHERE HouseNumber = @housenumber
      AND StreetNumber = @streetnumber
      AND Area = @area
      AND City = @city
      AND State = @state
      AND Country = @country
      AND PostalCode = @postalcode`;
    const selectRequest = new sql.Request();
    selectRequest.input('housenumber', sql.VarChar, formData.housenumber);
    selectRequest.input('streetnumber', sql.VarChar, formData.streetnumber);
    selectRequest.input('area', sql.VarChar, formData.area);
    selectRequest.input('city', sql.VarChar, formData.city);
    selectRequest.input('state', sql.VarChar, formData.state);
    selectRequest.input('country', sql.VarChar, formData.country);
    selectRequest.input('postalcode', sql.VarChar, formData.postalcode);
    const selectResult = await selectRequest.query(selectQuery);
    const addressId = selectResult.recordset[0].AddressId;

    // Insert Query for Customer Address
    const insertCustomerAddressQuery = `INSERT INTO CustomerAddress (CustomerId, AddressId) VALUES (@userid, @addressid)`;
    const insertCustomerAddressRequest = new sql.Request();
    insertCustomerAddressRequest.input('userid', signedUserId);
    insertCustomerAddressRequest.input('addressid', sql.Int, addressId);
    const insertCustomerAddressResult = await insertCustomerAddressRequest.query(insertCustomerAddressQuery);
    console.log("Data inserted successfully in Customer Address");

    await sql.close();
    res.status(200).send("Form data received and inserted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send("Error inserting data");
  }
});


// API endpoint to remove products from the cart
app.delete('/api/removefromcart/:productId', (req, res) => {
  const { productId } = req.params;
  // Find the index of the product in the cart array
  const index = cart.findIndex((product) => product.id === productId);
  if (index !== -1) {
    // Remove the product from the cart array
    cart.splice(index, 1);
    res.status(200).send('Product removed from cart successfully.');
  } else {
    res.status(404).send('Product not found in cart.');
  }
});
//.......................Order API
app.post("/api/order", async (req, res) => {
  console.log(signedUserId);
  console.log(req.body);
  console.log(cart);
  try {
    console.log("Entered Order API");
    const { paymentMethod, shipmentMethod, currentDate } = req.body;
    await sql.connect(config);

    // Fetch the ShippingMethodId based on shipmentMethod name
    const shippingMethodQuery = `SELECT ShippingMethodID FROM [ShippingMethod] WHERE Name = @shipmentMethod`;
    const requestShippingMethod = new sql.Request();
    requestShippingMethod.input('shipmentMethod', sql.VarChar(50), shipmentMethod);
    const shippingMethodResult = await requestShippingMethod.query(shippingMethodQuery);
    const shippingMethodId = shippingMethodResult.recordset[0]?.ShippingMethodID; // Use optional chaining to handle potential undefined result
    console.log("Shipping Method ID is: ", shippingMethodId);

    if (shippingMethodId) {
      // Insert order data with correct parameters
      const insertOrderQuery = `
        INSERT INTO [Order] (UserId, TotalAmount, ShippingMethodId, OrderDate, OrderStatus)
        VALUES (@userid, @totalBill, @shippingMethodId, @currentDate, @status)`;
      const requestInsertOrder = new sql.Request();
      requestInsertOrder.input('userid', sql.Int, signedUserId);
      requestInsertOrder.input('totalBill', sql.Decimal, 150.00); // Assuming TotalBill is decimal type
      requestInsertOrder.input('shippingMethodId', sql.Int, shippingMethodId);
      requestInsertOrder.input('currentDate', sql.Date, currentDate);
      requestInsertOrder.input('status', sql.Int, 1); // Assuming OrderStatus is integer type
      const resultOrder = await requestInsertOrder.query(insertOrderQuery);
      //..................Fetch User ID
      const selectOrderQuery = `SELECT * FROM [Order] WHERE UserId = @userid AND ShippingMethodId = @shipping`;
      const selectOrderRequest = new sql.Request();
      selectOrderRequest.input('userid', sql.Int, signedUserId);
      selectOrderRequest.input('shipping', sql.Int, shippingMethodId);
      const selectOrderResult = await selectOrderRequest.query(selectOrderQuery);
      const orderIdd = selectOrderResult.recordset[0].OrderId;

      if (resultOrder.rowsAffected && resultOrder.rowsAffected[0] > 0) {
        // Insert data into Payment table with correct parameters
        const insertPaymentQuery = `
          INSERT INTO [Payment] (OrderId, PaymentMethod, PaymentDate)
          VALUES (@orderId, @paymentMethod,@paymentDate)`;
        const requestInsertPayment = new sql.Request();
        requestInsertPayment.input('orderId', sql.Int, orderIdd); // Assuming OrderId is auto-generated
        requestInsertPayment.input('paymentMethod', sql.VarChar(50), paymentMethod);
        requestInsertPayment.input('paymentDate', sql.Date, currentDate); // Assuming PaymentDate is the same as OrderDate
        const resultPayment = await requestInsertPayment.query(insertPaymentQuery);
        console.log("Order data inserted successfully:", resultOrder.rowsAffected);
        console.log("Payment data inserted successfully:", resultPayment.rowsAffected);
        await sql.close();
        res.status(200).send("Order data and Payment data inserted successfully");
      } else {
        throw new Error("Failed to insert order data");
      }
    } else {
      throw new Error("Shipping Method ID not found");
    }
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send("Error inserting data");
  }
});


//.........................Give Review API 
app.post("/api/addreview", async (req, res) => {
  try {
    const formData = req.body;
    console.log("Received form data:", formData);
    await sql.connect(config);
    console.log("Connected to database");
    const rating = parseInt(formData.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error("Invalid rating. Rating must be a number between 1 and 5.");
    }
    const insertQuery = `
      INSERT INTO [Review] (UserId, Rating, Comment, ReviewDate)
      VALUES (@userid, @rating, @comment, @date)
    `;
    const currentDate = new Date();
    const insertRequest = new sql.Request();
    insertRequest.input('userid', signedUserId); // Assuming signedUserId is defined
    insertRequest.input('rating', sql.Int, rating); // Use sql.Int for integer values
    insertRequest.input('comment', sql.NVarChar, formData.reviewText); // Use sql.NVarChar for text
    insertRequest.input('date', sql.Date, currentDate); // Assuming currentDate is a valid date
    const insertResult = await insertRequest.query(insertQuery);
    console.log("Review inserted successfully");

    await sql.close();
    res.status(200).send("Form data received and inserted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send("Error inserting data");
  }
});
//.................................Delete Product API
app.delete("/api/deleteproduct/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    // Connect to the database
    await sql.connect(config);
    console.log("Connected to database");

    // Query to delete the product with the specified productId
    const deleteQuery = `
    
    DELETE FROM [Stock]
    WHERE ProductId = @productId;
    
    DELETE FROM [ProductCategory]
    WHERE ProductId = @productId;

    DELETE FROM [Product]
    WHERE ProductId = @productId;
    `;
    const deleteRequest = new sql.Request();
    deleteRequest.input('productId', sql.Int, productId);
    const deleteResult = await deleteRequest.query(deleteQuery);
    if (deleteResult.rowsAffected > 0) {
      console.log("Product deleted successfully");
      res.status(200).json({ message: 'Product deleted successfully' });
    } else {
      console.log("Product not found or already deleted");
      res.status(404).json({ error: 'Product not found or already deleted' });
    }

    await sql.close();
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).send("Error deleting product");
  }
});

//.................................Delete Category API
app.delete("/api/deletecategory/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    // Connect to the database
    await sql.connect(config);
    console.log("Connected to database");

    // Query to delete the product with the specified productId
    const deleteQuery = `DELETE FROM [Category] WHERE CategoryId = @categoryId`;
    const deleteRequest = new sql.Request();
    deleteRequest.input('categoryId', sql.Int, categoryId);
    const deleteResult = await deleteRequest.query(deleteQuery);
    if (deleteResult.rowsAffected > 0) {
      console.log("Product deleted successfully");
      res.status(200).json({ message: 'Product deleted successfully' });
    } else {
      console.log("Product not found or already deleted");
      res.status(404).json({ error: 'Product not found or already deleted' });
    }

    await sql.close();
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).send("Error deleting product");
  }
});
//...................Update Product API
app.post('/api/editproducts', async (req, res) => {
  try {
    const formData = req.body;
    console.log("Received form data:", formData);

    // Convert ProductId to integer
    const productId = parseInt(formData.ProductId);

    // Connect to the database
    await sql.connect(config);
    console.log("Connected to DataBase via Edit Products");


    const updateQuery = `
      UPDATE Product
      SET Name = @productname, 
          BrandName = @brand, 
          ImageUrl = @image, 
          Price = @price
      WHERE ProductID = @productid
    `;

    const updateRequest = new sql.Request();
    updateRequest.input('productname', sql.NVarChar, formData.Name);
    updateRequest.input('brand', sql.NVarChar, formData.BrandName);
    updateRequest.input('image', sql.NVarChar, formData.ImageUrl);
    updateRequest.input('price', sql.Decimal, formData.Price);
    updateRequest.input('productid', sql.Int, productId); // Use the parsed productId

    const updateResult = await updateRequest.query(updateQuery);
    console.log("Data Updated successfully");

    await sql.close();
    res.status(200).send("Form data received and updated successfully");
  } catch (err) {
    console.error("Error updating data:", err);
    res.status(500).send("Error updating data");
  }
});
//.....................Add Shipping Method API
app.post("/api/addshippingmethod", async (req, res) => {
  console.log("Entered Api of Shipping");
  try {
    const formData = req.body;
    console.log("Received form data:", formData);

    // Connect to the database (assuming you have a config object for database connection)
    await sql.connect(config);
    console.log("Connected to DataBase");

    // Query to insert data in ShippingMethod Table
    const insertQuery = `INSERT INTO ShippingMethod (Name, Price, EstimatedDeliveryDate, IsInternational, IsActive, MaxWeight, MinOrderAmount)
                       VALUES (@name, @price, @deliverydate, @isInternational, @isActive, @weight, @minorder)`;

    const insertRequest = new sql.Request();
    insertRequest.input('name', sql.VarChar, formData.name);
    insertRequest.input('price', sql.Decimal, formData.price);
    insertRequest.input('deliverydate', sql.Date, formData.deliverydate);
    insertRequest.input('isInternational', sql.Bit, formData.isInternational ? 1 : 0); // Convert boolean to bit (0 or 1)
    insertRequest.input('isActive', sql.Bit, formData.isActive ? 1 : 0); // Convert boolean to bit (0 or 1)
    insertRequest.input('weight', sql.Decimal, formData.weight);
    insertRequest.input('minorder', sql.Int, formData.minorder);

    // Execute the insert query
    const insertResult = await insertRequest.query(insertQuery);
    console.log("Shipping method inserted successfully");

    await sql.close();
    res.status(200).send("Form data received and shipping method inserted successfully");
  } catch (err) {
    console.error("Error inserting shipping method:", err);
    res.status(500).send("Error inserting shipping method");
  }
});
//.......................... Delete Shipping Method API
app.delete("/api/deleteshippingmethod/:shippingMethodId", async (req, res) => {
  try {
    const shippingMethodId = req.params.shippingMethodId;
    // Connect to the database
    await sql.connect(config);
    console.log("Connected to database");

    // Query to delete the shipping method with the specified shippingMethodId
    const deleteQuery = `DELETE FROM ShippingMethod WHERE ShippingMethodId = @shippingMethodId`;
    const deleteRequest = new sql.Request();
    deleteRequest.input('shippingMethodId', sql.Int, shippingMethodId);
    const deleteResult = await deleteRequest.query(deleteQuery);
    if (deleteResult.rowsAffected > 0) {
      console.log("Shipping method deleted successfully");
      res.status(200).json({ message: 'Shipping method deleted successfully' });
    } else {
      console.log("Shipping method not found or already deleted");
      res.status(404).json({ error: 'Shipping method not found or already deleted' });
    }

    await sql.close();
  } catch (err) {
    console.error("Error deleting shipping method:", err);
    res.status(500).send("Error deleting shipping method");
  }
});

//............................ Update Shipping Method API
app.post('/api/editshippingmethod', async (req, res) => {
  try {
    const formData = req.body;
    console.log("Received form data:", formData);

    // Convert ShippingMethodId to integer
    const shippingMethodId = parseInt(formData.ShippingMethodId);

    // Connect to the database
    await sql.connect(config);
    console.log("Connected to DataBase via Edit Shipping Method");


    const updateQuery = `
      UPDATE ShippingMethod
      SET Name = @name, 
          Price = @price, 
          EstimatedDeliveryDate = @estimatedDeliveryDate, 
          IsInternational = @isInternational,
          IsActive = @isActive,
          MaxWeight = @maxWeight,
          MinOrderAmount = @minOrderAmount
      WHERE ShippingMethodId = @shippingMethodId
    `;

    const updateRequest = new sql.Request();
    updateRequest.input('name', sql.NVarChar, formData.Name);
    updateRequest.input('price', sql.Decimal, formData.Price);
    updateRequest.input('estimatedDeliveryDate', sql.Date, formData.EstimatedDeliveryDate);
    updateRequest.input('isInternational', sql.Bit, formData.IsInternational);
    updateRequest.input('isActive', sql.Bit, formData.IsActive);
    updateRequest.input('maxWeight', sql.Float, formData.MaxWeight);
    updateRequest.input('minOrderAmount', sql.Decimal, formData.MinOrderAmount);
    updateRequest.input('shippingMethodId', sql.Int, shippingMethodId); // Use the parsed shippingMethodId

    const updateResult = await updateRequest.query(updateQuery);
    console.log("Shipping method Updated successfully");

    await sql.close();
    res.status(200).send("Form data received and updated successfully");
  } catch (err) {
    console.error("Error updating shipping method:", err);
    res.status(500).send("Error updating shipping method");
  }
});
//.....................Add Category API
app.post("/api/addcategory", async (req, res) => {
  try {
    const formData = req.body;
    console.log("Received form data for category:", formData);

    // Connect to the database
    await sql.connect(config);
    console.log("Connected to DataBase");

    // Query to insert data in Category Table
    const insertCategoryQuery = `
      INSERT INTO [Category] (Name, IsFeatured)
      VALUES (@categoryName, @isFeatured);
    `;

    const insertCategoryRequest = new sql.Request();
    insertCategoryRequest.input('categoryName', sql.VarChar, formData.categoryName);
    insertCategoryRequest.input('isFeatured', sql.Bit, formData.isFeatured ? 1 : 0);

    // Execute the insert query for Category
    await insertCategoryRequest.query(insertCategoryQuery);

    console.log("Category inserted successfully");

    await sql.close();
    res.status(200).send({ message: "Category added successfully" });
  } catch (err) {
    console.error("Error inserting category:", err);
    res.status(500).send("Error inserting category");
  }
});

//.......................................Analysis Part........................................


//...................................Query 1
app.get("/api/userorders", async (req, res) => {
  const { userName } = req.query;
  try {
    await sql.connect(config);
    // Query to fetch orders related to the selected user
    const userOrdersQuery = `
      SELECT o.OrderId, o.TotalAmount, o.OrderStatus, o.OrderDate
      FROM [Order] o
      INNER JOIN [User] u ON o.UserId = u.UserId
      WHERE u.UserName = @userName;
    `;
    const request = new sql.Request();
    request.input("userName", sql.NVarChar, userName);
    const result = await request.query(userOrdersQuery);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send("No orders found for the selected user");
    }
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).send("Error fetching user orders");
  }
});

//.................................. Query 2
app.get("/api/genderdistribution", async (req, res) => {
  try {
    await sql.connect(config);
    // Query to count male and female users in the User table
    const genderDistributionQuery = `
      SELECT
        SUM(CASE WHEN Gender = 'Male' THEN 1 ELSE 0 END) AS MaleCount,
        SUM(CASE WHEN Gender = 'Female' THEN 1 ELSE 0 END) AS FemaleCount
      FROM [User];
    `;
    const result = await sql.query(genderDistributionQuery);

    if (result.recordset.length > 0) {
      const { MaleCount, FemaleCount } = result.recordset[0];
      res.status(200).json({ male: MaleCount, female: FemaleCount });
    } else {
      res.status(404).send("Gender distribution not available");
    }
  } catch (error) {
    console.error("Error fetching gender distribution:", error);
    res.status(500).send("Error fetching gender distribution");
  }
});

//...................................Query 3
app.get("/api/topsellingproduct", async (req, res) => {
  try {
    await sql.connect(config);
    // Query to find the top-selling product based on SoldStock in TotalSales table
    const topSellingProductQuery = `
      SELECT TOP 1 p.Name, p.BrandName, p.Price, ts.SoldStock
      FROM Product p
      INNER JOIN TotalSales ts ON p.ProductId = ts.ProductId
      ORDER BY ts.SoldStock DESC;
    `;
    const result = await sql.query(topSellingProductQuery);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset[0]);
    } else {
      res.status(404).send("Top selling product not found");
    }
  } catch (error) {
    console.error("Error fetching top selling product:", error);
    res.status(500).send("Error fetching top selling product");
  }
});

//.................................Query 4
app.get('/api/users', async (req, res) => {
  try {
    // Connect to SQL Server
    await sql.connect(config);
    console.log("Connected to DataBase");
    const result = await sql.query`SELECT * FROM [User]`;
    // Send products data as response
    res.json(result.recordset);
    console.log("Response Send");
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  } finally {
    await sql.close();
  }
});
//.................................Query 5
app.get('/api/loyaltypoints', async (req, res) => {
  try {
    // Connect to SQL Server
    await sql.connect(config);
    console.log("Connected to DataBase");
    const result = await sql.query`SELECT * FROM [Cusotmer]`;
    // Send products data as response
    res.json(result.recordset);
    console.log("Response Send");
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  } finally {
    await sql.close();
  }
});
//.................................Query 6


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
