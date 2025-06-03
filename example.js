import {
  App,
  listen,
  config,
  controller,
  middleware,
  validation,
  router,
  registry,
} from "./index.js";

import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 20;

// 🔧 1. Ayarlar
config.set({
  port: 4000,
  mode: "dev",
  devtool: true,
});

// 🔐 2. Middleware
middleware.create(
  "logger",
  (req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  },
  true
);

middleware.create("auth", (req, res, next) => {
  if (req.headers.authorization !== "123") {
    return res.status(401).send("Unauthorized");
  }
  next();
});

// ✅ 3. Validation
validation.create("requireLang", (req, res, next) => {
  const { lang } = req.query;
  if (!lang || !["tr", "en"].includes(lang)) {
    return res.status(400).send("Geçersiz lang parametresi");
  }
  next();
});

// 🧠 4. Controller
controller.create("userDetailsWithQuery", ({ req, res }) => {
  const { name, surname } = req.params;
  res.json({
    message: `Merhaba ${name} ${surname}`,
    query: req.query,
  });
});

controller.create("ping", (req, res) => {
  res.send("Pong!");
});

// 🧭 5. Rotalar
router.group(
  "/api",
  {
    middlewares: middleware.use("logger"),
  },
  (api) => {
    api.group(
      "/user",
      {
        validations: validation.use("requireLang"),
        middlewares: middleware.use("auth"),
      },
      (user) => {
        user.get(
          "/:name/:surname/details",
          controller.use("userDetailsWithQuery")
        );
      }
    );
  }
);

router.group(
  "/status",
  {
    validations: validation.use("requireLang"),
    middlewares: middleware.use("auth"),
  },
  (r) => {
    r.get("/ping", controller.use("ping"));
  }
);

// 🖨️ 6. Özet Yazdır (İsteğe Bağlı)
console.log("🧪 Routes:");
router.getAll().forEach((group) => {
  console.log(`- ${group.basePath}`);
  group.routes.forEach((r) => {
    console.log(`   → ${r.method} ${r.path}`);
  });
});

router.group(
  "/registry",
  {}, // ⚠️ boş config verilmeli!
  (r) => {
    r.get("/", (req, res) => {
      res.json(registry.getRegistry());
    });
  }
);
// ✅ 7. Sunucu Başlat
listen();
