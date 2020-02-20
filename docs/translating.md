# How to add a new language to Oasis

### 1. Make your own fork of the Oasis repository

### 2. Add a new language choice on the settings page

https://github.com/fraction/oasis/blob/16f19e85fbff2b656dd0f9f361bb3ae9f9da4e20/src/views/index.js#L794-L797

```
    languageOption("en", "English"),
    languageOption("es", "Español")
```

Search the file for `English` to find the right spot.

### 3. Add translated strings to i18n.js

https://github.com/fraction/oasis/blob/16f19e85fbff2b656dd0f9f361bb3ae9f9da4e20/src/views/i18n.js#L4-L12

Add a new sub-object for the new language and put translated strings in it.

Oasis uses English as a fallback if a language is not complete yet, so you can work incrementally.

### 4. Make a pull request!
