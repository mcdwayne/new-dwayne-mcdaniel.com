I dug through the official Hacker Jeopardy material, the DEF CON recordings I could locate, historical DEF CON programs and forums, and, most usefully, a **2025 interview with current Hacker Jeopardy host Lintile specifically about how they write the questions**.

The biggest conclusion is that our game should become considerably more Hacker Jeopardy-like. The current questions I made are too much like certification-study questions. Hacker Jeopardy is built around **recall, association, hacker history, deliberately weird category construction, old technology, current security, and occasional traps**.

### What Lintile says they actually do

Lintile describes Hacker Jeopardy as educational underneath all the chaos. He says they intentionally cover the history of technology central to the profession in ways that make facts memorable. His favorite example is Telnet on port **23**. If you somehow walk into Hacker Jeopardy without knowing that, he says you're probably going to remember it afterward. [N2K CyberWire](https://thecyberwire.com/podcasts/microsoft-threat-intelligence/48/transcript)

The questions are primarily written by Lintile and another DFIU team member, Fizzgig, with other people checking them for breadth. One especially important design principle is **generational range**. He says they deliberately cover technologies from "the oldest of old school" through current material, including modern threat intelligence and threat groups. [thecyberwire.com](https://thecyberwire.com/podcasts/microsoft-threat-intelligence/48/transcript)

There is also intentional psychological trickery. Lintile says they use misdirection, recognizable patterns, and a little social engineering in the way clues are written. The idea is to make a contestant's brain jump toward the obvious answer and occasionally discover that the clue is asking for something slightly different. [N2K CyberWire](https://thecyberwire.com/podcasts/microsoft-threat-intelligence/48/transcript)

That is something I definitely want to borrow for the harder levels of our game.

### Port Math is absolutely central

This was the strongest confirmation of what you were aiming for.

Lintile calls **Port Math the historic longtime favorite category of Hacker Jeopardy**. Contestants have to remember the port numbers belonging to services and then perform addition, subtraction, multiplication, or division using those numbers. [thecyberwire.com](https://thecyberwire.com/podcasts/microsoft-threat-intelligence/48/transcript)

Older DEF CON material confirms that this has been part of the game for a very long time. The DEF CON 18 program explicitly warned contestants about having to calculate **long Hex, ASCII, and Port Math questions**. [Manuals+](https://manuals.plus/m/58eed5a4c7ddb2408fb49ab9c528ae35c98464d1d84218ff933b7e7feedb18b2?utm_source=chatgpt.com)

And the joke about Telnet is real. A 2019 Hacker Jeopardy clue asked contestants to identify the port normally associated with Telnet. Teams answered 21, 22, and 25. The expected answer was **23**, which became enough of an event that people wrote articles about it. [Security Boulevard](https://securityboulevard.com/2019/08/hacker-jeopardy-wrong-answers-only-edition/?utm_source=chatgpt.com)

So our game should go much further than:

> What port is SSH?

It should teach 22 first, reinforce it, and then eventually ask things like:

**SSH + Telnet = ?**  
22 + 23 = **45**

Or:

**HTTPS − DNS = ?**  
443 − 53 = **390**

Then we can create harder chains once someone has learned the underlying ports. Importantly, the **I don't know yet** button makes this work as education rather than punishment.

### The actual kinds of questions they ask

I found a very useful mini-round in which Sherrod DeGrippo actually gives Lintile Hacker Jeopardy-style questions. Lintile explicitly says some of these topics are regularly covered by Hacker Jeopardy. The clues include hacker/phreaker history, groups, DEF CON history, tools, and hacker movies. [N2K CyberWire](https://thecyberwire.com/podcasts/microsoft-threat-intelligence/48/transcript)

Some representative material, combining recorded questions, documented Hacker Jeopardy questions, and historical question material, looks like this:

- **Phreaking/history:** Identify the famous guide describing free long-distance calls. The intended response was the Blue Box Guide. Hacker/phreaker history is explicitly described as a recurring topic. [N2K CyberWire](https://thecyberwire.com/podcasts/microsoft-threat-intelligence/48/transcript)
- **Hacker groups:** Identify groups such as Cult of the Dead Cow and L0pht Heavy Industries from descriptions of what they did. [N2K CyberWire](https://thecyberwire.com/podcasts/microsoft-threat-intelligence/48/transcript)
- **DEF CON history:** The first DEF CON was held in Las Vegas, with the Alexis Park itself becoming recurring Hacker Jeopardy trivia. [N2K CyberWire](https://thecyberwire.com/podcasts/microsoft-threat-intelligence/48/transcript)
- **Tools:** "This tool, originally developed by Fyodor, is used to map out network hosts and services." Response: Nmap. [N2K CyberWire](https://thecyberwire.com/podcasts/microsoft-threat-intelligence/48/transcript)
- **Movies:** Identify *Hackers* from Zero Cool, *WarGames* from Matthew Broderick/global thermonuclear war, or Robert Redford as Martin Bishop in *Sneakers*. [N2K CyberWire](https://thecyberwire.com/podcasts/microsoft-threat-intelligence/48/transcript)
- **Basic hacker vocabulary:** A recorded DEF CON documentary actually captures the clue "Copyright lawyers mean this by I.P." The response is intellectual property. [Filmot](https://filmot.com/sidebyside/3ctQOmjQyYg/en-GB/en-GB/English%2B%28United%2BKingdom%29/English%2B%28United%2BKingdom%29/DEFCON%2B-%2BThe%2BFull%2BDocumentary?utm_source=chatgpt.com)
- **Crypto:** Historical proposed Hacker Jeopardy material includes identifying what RSA stands for: Rivest, Shamir, and Adleman. [Rants of a deranged squirrel.](https://jericho.blog/2020/12/01/the-hacker-jeopardy-that-never-was/)
- **Unix:** Questions included BSD versus System V lineage, the Solaris debugger `adb`, `fork()` creating child processes, and deliberately juvenile Unix-command wordplay involving `head` and `tail`. [Rants of a deranged squirrel.](https://jericho.blog/2020/12/01/the-hacker-jeopardy-that-never-was/)
- **Internet infrastructure:** A documented Final Hacker Jeopardy asked for the second-largest TLD by registrations after `.com` at the time. The answer was `.de`. [DEF CON Forums](https://forum.defcon.org/node/14436?utm_source=chatgpt.com)
- **Security people/current events:** One final asked contestants to identify security researcher Thomas Dullien from a then-current Black Hat immigration incident. [DEF CON Forums](https://forum.defcon.org/node/9817?utm_source=chatgpt.com)
- **Government/security history:** Another asked for former NSA director and Director of National Intelligence J. Michael McConnell. Another showed Richard Clarke, Howard Schmidt, and Amit Yoran and asked contestants to identify the U.S. cybersecurity czars. [DEF CON Forums](https://forum.defcon.org/node/10781?utm_source=chatgpt.com)
- **Geek culture:** One Final asked the *Hitchhiker's Guide* joke, "What do you get if you multiply six by nine?" expressed in base 13. Answer: **42**. [DEF CON Forums](https://forum.defcon.org/node/9817?utm_source=chatgpt.com)
- **Completely unexpected knowledge:** Hacker Jeopardy has occasionally thrown in material such as the Battle of Agincourt. That unpredictability appears to be deliberate. [DEF CON Forums](https://forum.defcon.org/node/9817?utm_source=chatgpt.com)

An especially revealing old Hacker Jeopardy for Kids poster literally told prospective players to study **Port Math, acronyms, Internet history, HTML, famous hackers, movie hacks, passwords, and more**. [Rod Soto](https://rodsoto.net/wp-content/uploads/2021/06/DEFCON21program.pdf?utm_source=chatgpt.com)

And this goes all the way back to the beginning. A 1995 announcement for Hacker Jeopardy advertised possible categories including **Famous Busts, Famous Narks, UNIX Bugs, Telco Tech, and "Hacking."** [MIT Discuss](https://diswww.mit.edu/MENELAUS.MIT.EDU/cpunks/29354?utm_source=chatgpt.com)

### One important distinction in my research

I confirmed your specific link is the official **DEF CON 33 Hacker Jeopardy Saturday** recording from 2025. [YouTube](https://www.youtube.com/watch?v=5gGUh9-oPhk\&utm_source=chatgpt.com) Unfortunately, its full automatic captions are not currently exposed through the searchable transcript sources I can access. I therefore do **not** want to pretend that questions I found elsewhere came from that specific 2025 Saturday recording.

The evidence around it is still unusually strong because we have Lintile's own 2025 transcript explaining exactly how he and Fizzgig design the game, several recorded clue examples, archived official results containing Final Hacker Jeopardy clues, old programs, and early question sets.

There's also a historical question collection from Jericho that is fascinating, but he explicitly says those proposed questions were probably **never actually used**. I would use it to understand the style, particularly the Unix and early hacker-culture obsession, rather than label those as authentic played clues. [Rants of a deranged squirrel.](https://jericho.blog/2020/12/01/the-hacker-jeopardy-that-never-was/)

### What this means for our game

I think we should change the underlying philosophy.

Instead of a generic networking quiz with a security-history category, we should build a **Hacker Jeopardy training machine**.

A beginner should encounter:

**Telnet → 23**

Then later:

**SSH → 22**

Then:

**What is SSH + Telnet? → 45**

Then eventually:

**(HTTPS − DNS) ÷ SMTP = ?**

That forces recall, math, and associations.

The same progression works for history. First teach **Morris Worm → 1988 → Robert Tappan Morris → Unix/Internet → CERT/CC** as separate facts. Later ask clues that require connecting two or three of them.

Likewise, somebody learns Nmap. Later they get Fyodor. Later they have to connect Fyodor → Nmap → host/service discovery → port scanning.

And we should add Hacker Jeopardy-style categories that are much more memorable than textbook headings. I can see categories such as **Port Math**, **Old Man Yells at Unix**, **Hack the Planet**, **Who Owns This Port?**, **Before There Was Wi-Fi**, **Famous Worms**, **Name That Hacker**, **Movie Hacking**, **What the RFC?**, **Hex, ASCII & Friends**, **APT Before & After**, **Um, Actually...**, and **Things You Should Know But Somehow Don't**.

The **"I don't know yet. Teach me."** feature becomes especially important in this model. When someone hits it on "Telnet," we teach them **23**, explain why Telnet matters historically, maybe mention why SSH largely displaced it, and then deliberately bring 23 back several questions later in Port Math.

That is much closer to what Lintile says Hacker Jeopardy is secretly doing: making people remember things.

I think our next build should expand from roughly 30 ordinary questions to an initial **150-question learning bank**, with perhaps **40 of those devoted just to ports, protocols, Port Math, hex, binary, and ASCII**, plus a spaced-repetition system that brings back anything the player misses or chooses "I don't know yet" on.
