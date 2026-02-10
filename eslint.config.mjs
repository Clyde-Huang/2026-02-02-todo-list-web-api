import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier"; // ✅ 1. 匯入 Prettier 設定
import airbnbBase from "eslint-config-airbnb-base"; // ✅ 2. 匯入 Airbnb Base

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],

    plugins: { js },

    // ✅ 3. 擴充 Airbnb + JS Recommended
    extends: [
      "js/recommended", // ESLint 官方推薦
      "airbnb-base", // Airbnb 風格
      eslintConfigPrettier // 放最後避免與其他規則衝突
    ],

    languageOptions: { globals: globals.browser },

    rules: {
      ...js.configs.recommended.rules,

      // 完全禁止 alert
      "no-alert": "error",

      // 允許使用 console，但會警告，專案後可在裝打包時移除 console
      "no-console": "warn",

      // 允許 ++ 運算
      "no-plusplus": "off",

      // 字串連接改警告 (prefer-template)
      "prefer-template": "warn",

      // 解構賦值改警告 (prefer-destructuring)
      "prefer-destructuring": "warn",

      // 允許修改物件的屬性，但不允許重新賦值參數本身
      "no-param-reassign": [
        "error",
        {
          props: false // 允許修改參數的屬性
        }
      ],

      // 允許特定參數名稱重複
      "no-shadow": [
        "error",
        {
          allow: ["users"]
        }
      ],

      // --- 原本 JS Recommended 規則 ---
      // 1. 強制要求宣告時必須賦值 (針對 let)
      // 如果你寫 let a; 就會報錯
      "init-declarations": ["error", "always"],

      // 1.5 額外推薦：如果變數沒被重新賦值，強制使用 const
      "prefer-const": "error",

      // 2. 強制使用 camelCase 駝峰式命名 (如 firstName)
      camelcase: ["error", { properties: "always" }],

      // 3. 禁止使用 var，強制用 let/const (符合現代標準)
      "no-var": "error"
    }
  }
]);
