// core/router.js
import express from "express";
import { v4 as uuidv4 } from "uuid";
import {
  registerGroupStart,
  registerGroupEnd,
  registerRoute,
  registerControllerUsage,
  registerMiddlewareUsage,
} from "./registry.js";
// Denetleyici modülünden getAll işlevini getControllers olarak içe aktarıyoruz
import { getAll as getControllers } from "./controller.js";

const expressRouter = express.Router();
const routeGroups = [];
const pathStack = [];

function normalizePath(path) {
  return path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

function extractParamsFromPath(path) {
  const paramRegex = /:([a-zA-Z0-9_]+)/g;
  const params = {};
  let match;
  while ((match = paramRegex.exec(path))) {
    params[match[1]] = `:${match[1]}`;
  }
  return params;
}

function getName(fn) {
  return (
    fn.controllerName ||
    fn.middlewareName ||
    fn.validationName ||
    fn.name || // Satır içi işlevlerin çıkarılmış adı olabilir
    "anonymous"
  );
}

function group(basePath, options, callback) {
  if (typeof basePath !== "string")
    throw new Error("group() ilk argüman string olmalı");

  if (typeof options !== "object" || typeof callback !== "function")
    throw new Error("group(path, options, callback) şeklinde kullanılmalı");

  const {
    description = "",
    expectedParams = [],
    expectedQuery = [],
    middlewares: rawMiddlewares = [],
    validations: rawValidations = [],
  } = options;

  // .use() çağrılarından gelen ve dizi döndürebilen ara yazılımları ve doğrulamaları düzleştir
  const middlewares = (
    Array.isArray(rawMiddlewares)
      ? rawMiddlewares
      : rawMiddlewares
      ? [rawMiddlewares]
      : []
  ).flat();

  const validations = (
    Array.isArray(rawValidations)
      ? rawValidations
      : rawValidations
      ? [rawValidations]
      : []
  ).flat();

  pathStack.push(basePath);
  const fullBasePath = normalizePath(pathStack.join(""));
  const simulatedParams = extractParamsFromPath(fullBasePath);
  const simulatedQuery = Object.fromEntries(
    expectedQuery.map((q) => [q, `:${q}`])
  );

  // `validations` ve `middlewares` zaten düzleştirildiği için `allHandlers` da düz olacaktır
  const allHandlers = [...validations, ...middlewares]; // Önce doğrulamalar, sonra ara yazılımlar

  if (allHandlers.length > 0) {
    expressRouter.use(fullBasePath, ...allHandlers); // Düzleştirilmiş işleyicileri yay
    allHandlers.forEach((fn) => {
      const name = getName(fn); // fn burada .flat() sayesinde gerçek bir işlevdir
      registerMiddlewareUsage(name, fullBasePath);
    });
  }

  const groupId = uuidv4();
  registerGroupStart({
    id: groupId,
    basePath: fullBasePath,
    description,
    params:
      expectedParams.length > 0 ? expectedParams : Object.keys(simulatedParams),
    expectedQuery,
    middlewares: middlewares.map(getName), // `middlewares` dizisi gerçek işlevleri içerir
    validations: validations.map(getName), // `validations` dizisi gerçek işlevleri içerir
  });

  const localRoutes = []; // localRoutes bu grup çağrısına özeldir, bu doğru

  // Düzeltilmiş defineRoute işlevi, 'group' içinde iç içe geçerek 'localRoutes' ve 'fullBasePath'ye erişir
  const defineRoute = (method) => {
    return (path, ...rawHandlers) => {
      // DÜZELTME 1: İşleyici (handler) dizisini düzleştir
      const handlers = rawHandlers.flat();
      const routeFullPath = normalizePath(fullBasePath + path);

      // Express router'a kaydet
      expressRouter[method.toLowerCase()](routeFullPath, ...handlers);

      const routeControllers = [];
      const routeMiddlewares = [];
      const routeValidations = [];

      // controller.getAll() için yeniden adlandırılmış içe aktarım
      const allRegisteredControllers = getControllers();

      handlers.forEach((fn) => {
        // fn artık tek bir işlevdir
        const funcNameFromGetName = getName(fn); // Başlangıçta mümkün olan en iyi adı al

        if (fn.controllerName) {
          // Bu bir denetleyicidir, muhtemelen controller.use() ile sarmalanmıştır
          routeControllers.push({
            name: fn.controllerName,
            id: fn.controllerName, // ID kaynağı olarak ad kullanılıyor, farklı bir ID kaynağı varsa ayarlanabilir
          });
          registerControllerUsage(fn.controllerName, routeFullPath);
        } else if (fn.middlewareName) {
          // Bu bir ara yazılımdır
          routeMiddlewares.push(fn.middlewareName);
          registerMiddlewareUsage(fn.middlewareName, routeFullPath);
        } else if (fn.validationName) {
          // Bu bir doğrulamadır
          routeValidations.push(fn.validationName);
          // Doğrulamaların da registerMiddlewareUsage veya benzer bir kayıt işlevi kullandığını varsayıyoruz
          registerMiddlewareUsage(fn.validationName, routeFullPath);
        } else {
          // Yedek durum: Doğrudan geçirilen orijinal bir denetleyici işlevi veya satır içi anonim bir işlev olabilir
          let isOriginalController = false;
          // allRegisteredControllers null/tanımsız değilse kontrol et
          if (allRegisteredControllers) {
            for (const ctrlNameKey in allRegisteredControllers) {
              // .includes çağrılmadan önce allRegisteredControllers[ctrlNameKey]'nin bir dizi olduğundan emin ol
              if (
                Array.isArray(allRegisteredControllers[ctrlNameKey]) &&
                allRegisteredControllers[ctrlNameKey].includes(fn)
              ) {
                routeControllers.push({
                  name: ctrlNameKey,
                  id: ctrlNameKey,
                });
                registerControllerUsage(ctrlNameKey, routeFullPath);
                isOriginalController = true;
                break;
              }
            }
          }

          if (!isOriginalController) {
            // Satır içi işlevler (örn. (req, res) => { ... }) veya tanınmayan işlevler için
            // getName işlevi varsa gerçek adını veya "anonymous" döndürür
            routeControllers.push({
              name: funcNameFromGetName, // Anonim satır içi işlevler için bu 'anonymous' olur
              id:
                funcNameFromGetName === "anonymous"
                  ? "anonymous"
                  : funcNameFromGetName,
            });
            // Gerçekten anonimse ve kullanımını kaydetmek istiyorsanız:
            // if (funcNameFromGetName === "anonymous") {
            // İstenirse anonim denetleyici kullanımı kaydedilebilir, ancak genellikle adlandırılmış denetleyiciler tercih edilir.
            // }
          }
        }
      });

      const routeId = uuidv4();

      // Bu kısım, geçerli grubun özeti için localRoutes dizisini doldurur
      localRoutes.push({
        id: routeId,
        method: method.toUpperCase(),
        path: routeFullPath, // Konsol özetiniz için tam yol kullanılıyor
      });

      registerRoute({
        id: routeId,
        method: method.toUpperCase(),
        path, // Grup içindeki rota için göreli yol
        fullPath: routeFullPath,
        controllers: routeControllers, // Nesne dizisi: [{ name, id }]
        middlewares: routeMiddlewares, // Ara yazılım adları dizisi
        validations: routeValidations, // Doğrulama adları dizisi
      });
    };
  };
  // defineRoute sonu

  const r = {
    use: (...rawHandlersUse) => {
      const handlersToUse = rawHandlersUse.flat(); // Tutarlılık için burada da düzleştir
      expressRouter.use(fullBasePath, ...handlersToUse);
      handlersToUse.forEach((fn) => {
        const name = getName(fn);
        registerMiddlewareUsage(name, fullBasePath);
      });
    },
    get: defineRoute("GET"),
    post: defineRoute("POST"),
    put: defineRoute("PUT"),
    delete: defineRoute("DELETE"),
    patch: defineRoute("PATCH"),
    all: defineRoute("ALL"),
    group, // özyinelemeli
  };

  callback(r, simulatedParams, simulatedQuery);

  routeGroups.push({
    id: groupId,
    basePath: fullBasePath,
    routes: localRoutes, // localRoutes bu grubun özetini içerir
  });

  pathStack.pop();
  registerGroupEnd();
}

function getAll() {
  // Bu, konsol özeti içindir, registry.getRegistry() için değil
  return [...routeGroups];
}

function getRouter() {
  return expressRouter;
}

export { group, getAll, getRouter };
