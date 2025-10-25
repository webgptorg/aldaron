[x]

The `BookEditor` in the `/components/hero-section.tsx` should be able to be prefilled with a `?book=<book_id>` from a get param.

---

[.] _<- Note: Implementing manually_

When the `book` get param is present in the URL, the `BookEditor` should load the book from that GET param (already implemented) and also propagate the changes into the GET param so that the URL is always in sync with the current book being edited.

-   This should work only when the `book` get param is present. If it's not present, the `BookEditor` should save its state only using useState as it does now.
-   Debounce the URL updates to avoid excessive URL changes while the user is typing.
