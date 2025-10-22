## 🍱 Delish Lab - Development - Behind The Scenes 

### Level 1: Basic UI Layout
Built foundational HTML structure using semantic containers:
  - `.fridge`, `.counter`, `.sink`, `.cook`, `.storage`, `.bin` established layout with `flexbox` and `vh` units.
 
### Level 2: API Integration
resource: MealDB
  - implemented fetch and show based on desired category.

### Level 2.1: Display fetched result
designed a dual card to format the desired result that was fetched.

### Level 3.1: Animation – Door Mechanics
set up door opening, sliding and pulling out using pure css
  - meddled with css combinators and z index to bring door mechanisms to life.

___________________________________

## working of fetch API

fetch - Web API offered by the browser environment

1. **fetch(url)**
   - Sends HTTP request to the server.
   - Returns **promise[1]** → resolves to a `Response` object when headers are received.

2.  **.then(response => ...)**
   - Handles **promise[1]**.
   - Commonly calls `response.json()` / `response.text()` / `response.blob()`.
   - These return **promise[2]** → resolves when body is fully read & parsed.

3.  **.then(data => ...)**
   - Handles **promise[2]**.
   - Works with parsed data.

4.  **.catch(error => ...)**
   - Catches network errors, parsing errors, or thrown errors in `.then()`.
   - HTTP errors (404, 500) don’t reject automatically — check `response.ok`.
