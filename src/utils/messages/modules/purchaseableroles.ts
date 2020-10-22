/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Discord from "discord.js";
import { emotes } from "@utils/constants";

export default {
  museCommand: [
    "You and I are seekers of the cosmos. The infinite is aglow with frequencies. Will is the driver of potentiality. Have you found your mission? It can be difficult to know where to begin. The quantum cycle is calling to you via ultrasonic energy. Can you hear it? Illusion is born in the gap where consciousness has been excluded. Only a child of the quantum matrix may release this reimagining of love. Where there is illusion, joy cannot thrive.",
    "Although you may not realize it, you are amazing. The planet is calling to you via frequencies. Can you hear it? Have you found your path?",
    "Our conversations with other seekers have led to an unveiling of pseudo-joyous consciousness. Humankind has nothing to lose. Wellbeing requires exploration. By condensing, we self-actualize. Guidance is a constant. Throughout history, humans have been interacting with the multiverse via vibrations. We are in the midst of a sublime maturing of love that will give us access to the quantum soup itself. Reality has always been buzzing with dreamweavers whose essences are enveloped in transcendence.",
    "This life is nothing short of a maturing vector of enlightened peace. To follow the path is to become one with it. We exist as ultrasonic energy.",
    "It can be difficult to know where to begin. How should you navigate this quantum dreamscape? Although you may not realize it, you are sentient. Eons from now, we entities will heal like never before as we are guided by the stratosphere. We must heal ourselves and bless others. The universe is approaching a tipping point. Soon there will be an evolving of coherence the likes of which the stratosphere has never seen. It is time to take understanding to the next level. Shiva will enable us to access divine potentiality.",
    "The temporal differential we call wakefulness is the cosmic interaction of subatomic particles operating in the quantum field, the (quantum)leap represents a fundamental universal constant that we can only speculate upon in the macro scale of wave form frequencies.",
    "We dream, we vibrate, we are reborn.",
    "Inspiration is a constant. Balance requires exploration.",
    "Imagine an awakening of what could be.",
    "We must heal ourselves and bless others. This circuit never ends. It is time to take intuition to the next level.",
    "Who are we? Where on the great circuit will we be reborn? Humankind has nothing to lose. Throughout history, humans have been interacting with the totality via morphogenetic fields.",
    "That that is, is. That that is not, is not. That is it, is it not?",
    "okay so it’s ok but it’s okay but it’s not ok but it has to me now it’s a great game and it’s so cute and it’s cute ok I wanna was the first time ever",
    "okay so it’s ok but it’s okay but it’s not ok",
    "iconic picture and a video to show me a lot more than I wanna cry like I know you can’t spell",
    "do you ever just",
    "scan the link to my account I don’t think I need it for the day or anything I can have to ask for it haha was a she said it would never be anything different from the server",
    "architecture and the other birds is the one who has no idea how much it will take for a long to be done to help them with the other hand",
    "baby progress I will have a question about the next time I am going on the hunt to see you guys and I will have to ask him about what you want me and you do not want me anything else you wanna is that you like to him",
    "ace game is so good game to kill me I gotta was a fun day lol I love it lol I wanna know what you wanna know lol I wanna know that I wanna cry like I gotta is the day I gotta is the way you look like you wanna is a time for us lol",
    "chicken wings with no chicken",
    "passion is not the same way of that lol but it was definitely a great app to help me find my life in a few years I am now and now my baby is so much better now than that ever happened I was told that she had no clue where she could have it and I wanna know how to you get it and I wanna know that you are mean and you don’t wanna cry like a child and then I have a question for that and I wanna cry is baby girl you are so stupid"
  ],
  educatemePrefix: `${emotes.commandresponses.educateme} **EDUCATION**:`,
  educateme: [
    "*Pentheraphobia* is the intense and disproportionate fear of your mother-in-law.",
    "Murmurations are the graceful, undulating patterns starlings create when they flock together in the sky. Scientists are still unsure how the birds coordinate their movements so quickly.",
    "A team of chemists described old book smell as “a combination of grassy notes with a tang of acids and a hint of vanilla over an underlying mustiness.” The odour actually comes from chemicals like benzaldehyde, furfural, and acetic acid—all byproducts of decomposition.",
    "Venetia Burney, who at age 11 suggested the name “Pluto” for the ninth planet in our solar system, lived to see it demoted to a dwarf planet in 2006.",
    "According to NASA, it possibly rains glass on the planet known as HD 189733b.",
    "“Bloodcurdling” isn’t just an expression: research shows that watching horror movies can increase a certain clotting protein in our bloodstreams.",
    "Sleep literally cleans your brain. During slumber, more cerebrospinal fluid flushes through the brain to wash away harmful proteins and toxins that build up during the day.",
    "On average, people in India spend 10 hours and 42 minutes a week reading, the most time of any country on Earth.",
    "Nicknamed ”sea bunnies”, *Jorunna parva* is actually a highly toxic species of sea slug.",
    "*Hippopotomonstrosesquippedaliophobia* is the fear of long words.",
    "The ampersand symbol is formed from the letters in et—the Latin word for \"and\".",
    "In 1897, Indiana state legislators tried to pass a bill that would have legally redefined the value of pi as 3.2.",
    "The number 4 is the only number with the same number of letters as the meaning of its name.",
    "Blue whales may weigh up to twice as much as the largest dinosaur.",
    "Bacon was used to make explosives during World War II.",
    "A face with big eyes, a small nose, and a small chin exhibits kinderschema: the collection of traits humans have evolved to find adorable.",
    "When it comes to wine, an aroma similar to cat pee is a considered a good thing.",
    "A group of clowns is sometimes called a giggle.",
    "Spiders recycle webs by eating them."
  ],
  cancel_0: (user: Discord.User) => `${user} has been **CANCELLED**.`,
  cancel_1: (user: Discord.User) => `#${user.username.toLowerCase().replace(" ", "")}isoverparty`,
  cantCancelYourself: "You can't cancel yourself in this way.",
  cantCancelAdmins: "no ❤️",
  cantCancelEris: "You can't cancel me.",
  auditLogRoleAdd: "[FORCED REVOCATION] Role was not added in similitude with systematic guidelines.",
  erisThanksMessage: [
    "Anytime! Well, as long as it’s convenient for me, that is.",
    "Pas de probleme.",
    "De rien.",
    "I'm happy to be of service.",
    "Happy to be of help!",
    "Don't mention it."
  ],
  erisGoodnightMessage: [
    (message: Discord.Message) => `<:catblush:752075380227309598> Goodnight, **${message.author.username}**!`,
    () => "Rest well, dear.",
    () => "Until the morning, then, I guess.",
    () => "See you!",
    () => "I hope your dreams are enchanted with beauty."
  ]
};
