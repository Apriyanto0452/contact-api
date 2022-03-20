const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const { body, validationResult, check } = require("express-validator");
const cors = require("cors");

const port = process.env.PORT || 3000;

const {
  loadContact,
  findContact,
  addContact,
  cekDuplikat,
  deleteContact,
  updateContacts,
} = require("./utils/contacts");

// konfigurasi bahwa kita menggunakan express layouts
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// konfigurasi bahwa kita menggunakan ejs
app.set("view engine", "ejs");

//Route/setting request page

//Index / halan utama
app.get("/", (req, res) => {
  console.log("GET /");

  const contacts = loadContact();
  res.render("index", {
    title: "Halaman List Contact",
    layout: "layouts/main-layout",
    contacts,
  });
});

//halaman form tambah data contact
app.get("/add", (req, res) => {
  res.render("add-contact", {
    title: "Tambah Contact",
    layout: "layouts/main-layout",
  });
});

// proses data contact
app.post(
  "/add-contact",
  [
    body("nama").custom((value) => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error("Nama Contact Sudah digunakan!");
      }
      return true;
    }),
    check("email", "Email Tidak Valid").isEmail(),
    check("nohp", "No HP tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    // try{

    // } catch (error){

    // }
    console.log("req.body", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
      // res.render("add-contact", {
      //   title: "Form Tambah Data Contact",
      //   layout: "layouts/main-layout",
      //   errors: errors.array(),
      // });
    }

    addContact(req.body);
    return res.status(201).send({
      status: "success",
      data: req.body,
    });
    // res.redirect("/");
  }
);

app.get("/delete/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  if (!contact) {
    res.status(404);
    res.send("<h1>404</h1>");
  } else {
    deleteContact(req.params.nama);
    res.redirect("/");
  }
});

app.get("/detail", (req, res) => {
  res.send("Contoh");
});
app.get("/edit/:nama", (req, res) => {
  const contact = findContact(req.params.nama);

  res.render("edit-contact", {
    title: "Halaman Edit contact",
    layout: "layouts/main-layout",
    contact,
  });
});

app.post(
  "/update",
  [
    body("nama").custom((value, { req }) => {
      const duplikat = cekDuplikat(value);
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama Contact Sudah digunakan!");
      }
      return true;
    }),
    check("email", "Email Tidak Valid").isEmail(),
    check("nohp", "No HP tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render("edit-contact", {
        title: "Form Ubah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      updateContacts(req.body);
      res.redirect("/");
    }
  }
);

app.get("/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  res.render("detail", {
    title: "Halaman Detail",
    layout: "layouts/main-layout",
    contact,
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
