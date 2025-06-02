// example.js
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

// 🛠 EventEmitter uyarısını önle
import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 20;

// ✅ 1. Config Ayarları
config.set({
  port: 4000,
  mode: "dev",
});

// ✅ 2. Middleware Tanımları
middleware.create(
  "logger",
  (req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  },
  true,
  {
    description: "Tüm istekleri loglayan global middleware",
  }
);

middleware.create(
  "auth",
  (req, res, next) => {
    if (req.headers.authorization !== "123") {
      return res.status(401).send("Unauthorized");
    }
    next();
  },
  false,
  {
    description: "Authorization header kontrolü",
  }
);

// ✅ 3. Validation Tanımları
validation.create(
  "requireLang",
  (req, res, next) => {
    const { lang } = req.query;
    if (!lang || !["tr", "en"].includes(lang)) {
      return res.status(400).send("Geçersiz lang parametresi");
    }
    next();
  },
  false,
  {
    description: "lang query parametresi zorunlu ve tr/en olmalı",
    expectedQuery: ["lang"],
  }
);

// ✅ 4. Controller Tanımları
controller.create("userDetailsWithQuery", ({ req, res }) => {
  const { name, surname } = req.params;
  const query = req.query;

  console.log("➡️ İsim:", name);
  console.log("➡️ Soyisim:", surname);
  console.log("➡️ Query:", query);

  res.json({
    message: `Merhaba ${name} ${surname}`,
    query,
  });
});

controller.create("ping", (req, res) => {
  res.send("Pong!");
});

// ✅ 5. Route Tanımları
function testRoutes() {
  router.group(
    "/api",
    {
      description: "API ana grubu",
      middlewares: middleware.use("logger"),
    },
    (api) => {
      api.group(
        "/user",
        {
          description: "Kullanıcı grubu",
          expectedQuery: ["lang"],
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
    "/registry",
    {}, // ⚠️ boş config verilmeli!
    (r) => {
      r.get("/", (req, res) => {
        res.json(registry.getRegistry());
      });
    }
  );

  router.group(
    "/status",
    {}, // ⚠️ boş config verilmeli!
    (r) => {
      r.get("/ping", controller.use("ping"));
    }
  );
}
testRoutes();

// ✅ Debug Bilgileri
console.log("📦 Config:", config.getAll());
console.log("📦 Middleware:", middleware.getAll());
console.log("📦 Global Middleware:", middleware.getAllGlobal());
console.log("📦 Controllers:", controller.getAll());
console.log("📦 Validations:", validation.getAll());

console.log("📦 Routes:");
router.getAll().forEach((group) => {
  console.log(`  • ${group.basePath}`);
  group.routes.forEach((r) => {
    console.log(`    - ${r.method} ${r.path}`);
  });
});

// ✅ Registry Detay Yazımı
function printRegistryDetails(registryData) {
  console.log("\n📚 [Registry Detay]");

  function printGroup(group, level = 0) {
    const indent = "  ".repeat(level);
    console.log(`${indent}- 📂 Group: ${group.basePath}`);
    if (group.params.length)
      console.log(`${indent}  ↪ Params: [${group.params.join(", ")}]`);
    if (group.middlewares.length)
      console.log(
        `${indent}  ↪ Middleware(s): [${group.middlewares.join(", ")}]`
      );
    if (group.validations?.length)
      console.log(
        `${indent}  ↪ Validation(s): [${group.validations.join(", ")}]`
      );

    for (const route of group.routes) {
      console.log(
        `${indent}  🔹 ${route.method} ${route.fullPath} ` +
          (route.controllers.length
            ? `→ Controller(s): [${route.controllers.join(", ")}] `
            : "") +
          (route.middlewares.length
            ? `| Middleware(s): [${route.middlewares.join(", ")}]`
            : "")
      );
    }

    for (const child of group.children) {
      printGroup(child, level + 1);
    }
  }

  console.log("\n📁 Groups:");
  for (const group of registryData.groups) {
    printGroup(group);
  }

  console.log("\n🎮 Controllers:");
  for (const [name, meta] of Object.entries(registryData.controllers)) {
    console.log(`- ${name}`);
    if (meta.middlewares.length)
      console.log(`  ↪ Middleware(s): [${meta.middlewares.join(", ")}]`);
    if (meta.routesUsedIn.length)
      console.log(`  ↪ Used in routes: [${meta.routesUsedIn.join(", ")}]`);
  }

  console.log("\n🧱 Middlewares:");
  for (const [name, meta] of Object.entries(registryData.middlewares)) {
    console.log(`- ${name} ${meta.isGlobal ? "(Global)" : ""}`);
    if (meta.usedIn.length)
      console.log(`  ↪ Used in routes: [${meta.usedIn.join(", ")}]`);
  }

  console.log("\n✅ Registry detay gösterimi tamamlandı.\n");
}
printRegistryDetails(registry.getRegistry());

// ✅ Sunucu Başlat
listen();
