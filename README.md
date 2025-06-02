
# 📘 Deeppress Framework - Geliştirici Dokümantasyonu (Tam Rehber)

Deeppress, Express.js tabanlı modern bir web çatısıdır. Bu doküman, framework'ün tüm bileşenlerini detaylı açıklamalar ve bol örnekle öğretmeyi amaçlar.

---

## 📦 Ana Modüller

| Modül         | Açıklama                                |
|---------------|-----------------------------------------|
| `App`         | Uygulama temel nesnesi                  |
| `listen()`    | Sunucuyu başlatır                       |
| `config`      | Konfigürasyon yönetimi                  |
| `controller`  | Controller (işlem fonksiyonları)        |
| `middleware`  | Express Middleware tanımlama ve yönetim |
| `validation`  | Request doğrulayıcıları                 |
| `router`      | Grup bazlı route tanımı                 |
| `registry`    | Tüm sistemsel ilişkilerin kaydı         |

---

## 🔧 config API

### `config.set(options)`

```js
config.set({ port: 4000, mode: "dev" });
```

| Alan   | Tip     | Açıklama                   | Zorunlu |
|--------|---------|----------------------------|---------|
| port   | number  | Sunucu portu               | ✅      |
| mode   | string  | `"dev"` veya `"prod"`      | ✅      |

### `config.get(key)` & `config.getAll()`

```js
config.get("port"); // 4000
config.getAll();    // { port: 4000, mode: "dev" }
```

---

## 🧱 middleware API

### `middleware.create(name, fn, isGlobal, options)`

```js
middleware.create("auth", (req, res, next) => {
  if (req.headers.authorization !== "123") {
    return res.status(401).send("Unauthorized");
  }
  next();
}, false, {
  description: "Authorization middleware",
  expectedQuery: ["token"],
});
```

| Parametre       | Tip       | Açıklama                          | Zorunlu |
|------------------|------------|------------------------------------|---------|
| name             | string     | Middleware adı                    | ✅      |
| fn               | function   | Express-style `(req, res, next)`  | ✅      |
| isGlobal         | boolean    | Tüm isteklerde aktif mi?          | ❌      |
| options          | object     | Ek metadata                       | ❌      |
| ↪ description    | string     | DevTool açıklaması                | ❌      |
| ↪ expectedQuery  | string[]   | Beklenen query parametreleri      | ❌      |
| ↪ expectedParams | string[]   | Beklenen URL parametreleri        | ❌      |

### Ekstra Middleware Örnekleri

```js
middleware.create("rateLimiter", (req, res, next) => {
  // Rate limit işlemleri
  next();
});

middleware.create("logger", (req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
}, true);
```

---

## ✅ validation API

### `validation.create(name, fn, isGlobal = false, options = {})`

```js
validation.create("requireLang", (req, res, next) => {
  const { lang } = req.query;
  if (!lang || !["tr", "en"].includes(lang)) {
    return res.status(400).send("Geçersiz lang");
  }
  next();
});
```

| Parametre        | Tip       | Açıklama                              | Zorunlu |
|------------------|------------|----------------------------------------|---------|
| name             | string     | Validation adı                        | ✅      |
| fn               | function   | Express-style middleware `(req, res, next)` | ✅      |
| isGlobal         | boolean    | Tüm isteklerde aktif mi?              | ❌      |
| options          | object     | Ek metadata                           | ❌      |
| ↪ description    | string     | DevTool açıklaması                    | ❌      |
| ↪ expectedQuery  | string[]   | Beklenen query parametreleri          | ❌      |
| ↪ expectedParams | string[]   | Beklenen URL parametreleri            | ❌      |

### Ek Validation Örnekleri

```js
validation.create("validateToken", (req, res, next) => {
  if (!req.query.token) return res.status(401).send("Token yok");
  next();
});
```

---

## 🎮 controller API

### `controller.create(name, fn, options = {})`

```js
controller.create("greetUser", ({ req, res }) => {
  res.send(`Merhaba ${req.params.name}`);
});
```

| Parametre        | Tip       | Açıklama                              | Zorunlu |
|------------------|------------|----------------------------------------|---------|
| name             | string     | Controller adı                        | ✅      |
| fn               | function   | Fonksiyon `(req, res)` veya context   | ✅      |
| options          | object     | Ek metadata                           | ❌      |
| ↪ description    | string     | Açıklama metni                        | ❌      |
| ↪ expectedQuery  | string[]   | Beklenen query parametreleri          | ❌      |
| ↪ expectedParams | string[]   | Beklenen URL parametreleri            | ❌      |

---

## 🧭 router API

### `router.group(basePath, options, callback)`

```js
router.group("/api", {
  middlewares: middleware.use("logger")
}, (api) => {
  api.group("/user", {
    validations: validation.use("requireLang"),
    middlewares: middleware.use(["auth"])
  }, (user) => {
    user.get("/:name/details", controller.use("greetUser"));
  });
});
```

| Parametre         | Tip         | Açıklama                                        | Zorunlu |
|-------------------|--------------|------------------------------------------------|---------|
| basePath          | string       | Route grubunun temel yolu                     | ✅      |
| options           | object       | Metadata, middleware, validation bilgileri     | ✅      |
| ↪ description     | string       | Açıklama metni                                | ❌      |
| ↪ expectedQuery   | string[]     | Beklenen query parametreleri                  | ❌      |
| ↪ expectedParams  | string[]     | Beklenen route parametreleri (`:id` vb.)      | ❌      |
| ↪ middlewares     | function[]   | `middleware.use(...)` çıktısı                | ❌      |
| ↪ validations     | function[]   | `validation.use(...)` çıktısı                | ❌      |
| callback          | function     | İç route'ları tanımlayan fonksiyon            | ✅      |

#### URL Örnekleri:
- `/api/user/:name/details` → `GET`

### Ek Route Örnekleri

```js
router.group("/admin", { middlewares: middleware.use("auth") }, (admin) => {
  admin.get("/dashboard", controller.use("adminDashboard"));
  admin.post("/add-user", controller.use("createUser"));
});
```

---

## 🧾 registry API

```js
registry.registerController("name", fn);
registry.registerMiddleware("name", fn);
registry.registerValidation("name", fn);
registry.registerRoute({ method, path, controller });
registry.getRegistry();
```

`getRegistry()` tüm sistem bileşenlerini döner. DevTool arayüzüne veri sağlar.

---

## 🧪 Karma Örnek

```js
router.group("/secure", {
  validations: validation.use(["requireLang", "validateToken"]),
  middlewares: middleware.use(["auth", "logger"])
}, (r) => {
  r.get("/profile", controller.use("userProfile"));
});
```

---

## 🟢 Sunucu Başlat

```js
listen();
```

---

## 📌 Notlar

- `expectedParams`, `expectedQuery` DevTool için analiz bilgisidir.
- `isGlobal: true` middleware her istekte çalışır.
- DevTool: kayıtlı controller, route, validation gibi her şeyi gösterir.

---

© 2025 - Deeppress Framework
