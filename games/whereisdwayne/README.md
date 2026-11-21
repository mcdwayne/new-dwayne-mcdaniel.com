# Where in the World Is Dwayne?

An 8-bit conference-trail trivia adventure. You want Dwayne McDaniel on your podcast, and he'll do it if you get him a new headshot. Chase him across 121 real in-person events from [his conference history](https://dwayne-mcdaniel.com/conferences.html) (2023 onward), explore each city, pass the geography quizzes, and collect his Event Challenge Coins. Each of the 12 cases you solve reveals a piece of the headshot.

Front end only: the whole game is `index.html`. No backend, no build step, nothing to install. It contacts no server and keeps nothing in the browser.

## Play

Open `index.html` in a browser, or the landing page at `../whereisdwayne.html`. Works on desktop and phone, with mouse, touch or keyboard.

## How it plays

- **Every case starts in Chicago**, where you just missed him. Cases can be played in any order.
- **The city map** is a rough sketch of each city from real coordinates, with its real water and its main airport in the true direction from downtown.
- **Four places have people**: the meetup (a geography pop quiz), the business district (a barista), the convention center (event staff) and the city's famous attraction (a tour guide). Each knows one fun fact about the city Dwayne flew to.
- **The airport is only for flying.** Pick his next city on the departures map.
- **Registration asks a geography question** about the city you landed in before it prints your badge.
- **Same city twice?** If he never left town, go back to the convention center and you'll catch him there.
- **Watch the clock**: 13 hours per stop. Run out and that case starts over.

## Save codes

Menu › Save code gives a code like `WD-XXXX-XXXX-XXXX-XXXX`. It holds your solved pieces and your exact spot in the case you're playing. Facilitator codes for each finished case are on the landing page under "Spoilers".

## Files

- `index.html` · the game, one self-contained file (pixel scenes, event data, city maps, quizzes, portrait)
- `shots/` · screenshots used by the landing page and games.html
- `../whereisdwayne.html` · the landing page

Fonts (Atkinson Hyperlegible, Pixelify Sans, VT323) load from Google Fonts. Accessibility: WCAG 2.2 AA, checked with axe-core on every screen at desktop and phone widths, and every label drawn inside the pixel scenes meets 4.5:1 contrast.
