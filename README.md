# 🌐 FOOTPRINT-X v1.0 | OSINT Terminal

**Advanced OSINT Reconnaissance Tool**
Footprint-X is a browser-based OSINT (Open Source Intelligence) terminal designed with a retro hacker-style interface. It allows you to perform reconnaissance on phone numbers, emails, and IP addresses in real-time.

---

## 🚀 Features

✅ Real-time OSINT lookup for:

* **IP addresses** (geolocation, network type, operator info)
* **Emails**
* **Phone numbers**

✅ Basic authentication for API security (default: `admin` / `admin123`)

✅ Retro terminal-style interface (green-on-black hacker theme)

✅ Modular structure: easy to extend with more reconnaissance modules

✅ Works locally on `http://localhost:3000`

---

## 🖥️ Screenshots

### Startup Screen

![Screenshot 2025-06-29 141549](https://github.com/user-attachments/assets/afd9faa1-b9a5-4896-8e70-4837eb0d1adb)

### Example OSINT Lookup

![Screenshot 2025-06-29 141713](https://github.com/user-attachments/assets/496adb17-161e-4c55-afa6-eed60182680e)

---
## ⚙️ Installation

```bash
git clone https://github.com/your-username/FootprintX.git
cd FootprintX
npm install
```

---

## 🏁 Running the app

```bash
# Backend
mvn spring-boot:run

# Frontend
npm install
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Default Credentials

* **Username:** `admin`
* **Password:** `admin123`

---

## 📂 Project Structure

```
FootprintX/
├── client/               # Frontend React code
├── server/               # Express server with OSINT routes
├── shared/               # Shared schemas/utilities
├── public/               # Static assets
├── src/main/java/        # Java components (if applicable)
├── package.json
├── tsconfig.json
├── README.md
```

---

## 📝 Example Usage

* Type an IP like `192.168.1.1` in the terminal to see its classification.
* Enter `help` to see available commands.

---

## 💡 Notes

* This tool is for **ethical hacking**, learning, and research only.
* All lookups are processed locally — no data is sent to third-party services unless configured.

---

## 🤝 Contributing

Feel free to fork and submit pull requests to add more reconnaissance modules or improve the terminal interface!

---

## 📜 License

MIT License. See `LICENSE` file.

---

If you'd like, I can help you **generate the screenshots folder**, **write upload instructions**, or **format the raw GitHub URLs for the images once you upload them**. Let me know!
