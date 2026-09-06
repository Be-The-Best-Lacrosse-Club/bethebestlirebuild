/* ================================================
   BTB FILM STUDY LAB — Data Layer
   Taxonomy, Google Sheet integration, state management
   ================================================ */

// ============= GOOGLE SHEET WEBHOOK CONFIG =============
const BTB_CONFIG = {
  filmStudyDataUrl: '/.netlify/functions/film-study-data',
  localServer: ''
};

// ============= BOYS TAXONOMY =============
const BOYS_TAXONOMY = {
  offense: {
    title: 'OFFENSE',
    icon: '⚔️',
    subcategories: {
      'Settled Offense': [
        'Motion Offense', '1-4-1 Formation', '2-3-1 Formation',
        '1-3-2 Formation', '3-3 Formation', 'Pick Plays',
        'Two-Man Game', 'Invert Plays / Position Swaps'
      ],
      'Dodging (1v1 Moves)': [
        { name: 'Split Dodge', active: true },
        'Face Dodge', 'Roll Dodge', 'Bull Dodge',
        'Inside Roll', 'Question Mark Dodge', 'Swim Move', 'Toe Drag'
      ],
      'Off-Ball Movement & Cutting': [
        'V-Cuts', { name: 'Backdoor Cuts', active: true },
        'Curl Cuts', 'Seal & Re-Cut', 'Timing & Spacing'
      ],
      'Shooting': [
        'Overhand Shot', 'Sidearm Shot', 'Underhand / Shovel Shot',
        'Behind-the-Back Shot', 'On-the-Run Shooting', 'Time & Room Shooting',
        'Quick Stick / Catch & Shoot', 'Shot Placement & Accuracy', 'Shot Fakes & Deception'
      ],
      'Transition Offense': [
        { name: 'Fast Breaks (4v3, 3v2)', active: true },
        'Slow Breaks / Secondary Break', 'Unsettled Situations',
        'Cherry Picking / Leak Plays', 'Outlet Passing'
      ],
      'Extra Man Offense (EMO)': [
        '3-3 EMO Set', '2-3-1 EMO Set', '1-4-1 EMO Set',
        'Ball Rotation Patterns', 'Skip Passes', 'Quick Shot Opportunities'
      ],
      'Clearing': [
        'Settled Clears', 'Press Break Clears', 'Goalie-Led Clears',
        'Midfield Carry Clears', 'Sideline Clears'
      ]
    }
  },
  defense: {
    title: 'DEFENSE',
    icon: '🛡️',
    subcategories: {
      'Team Defense / Slides': [
        'Adjacent Slides', 'Crease Slides', 'Backside Rotation',
        'Slide Recovery', 'Communication & Calls',
        'Defending Picks & 2-Man Games'
      ],
      'Zone Defense': [
        'Backer Zone', '3-3 Zone', 'Zone Principles & Rotations'
      ],
      'Man-to-Man Defense': [
        'On-Ball Footwork & Positioning', 'Off-Ball Positioning & Help',
        'Approach Technique', 'Body Positioning & Leverage', 'Trail Technique'
      ],
      'Stick Checks': [
        'Poke Check', 'Lift Check', 'Slap Check',
        'Trail Check', 'Wrap Check', 'Take-Away Checks'
      ],
      'Man-Down Defense': [
        'Rotation Packages', 'Shot Clock Management',
        'Clearing from Man-Down', 'Pressure vs Contain'
      ],
      'Riding (Preventing Clears)': [
        { name: '10-Man Ride', active: true },
        'Press Ride', 'Zone Ride', 'Midfield Ride'
      ]
    }
  },
  goalie: {
    title: 'GOALIE',
    icon: '🥅',
    subcategories: {
      'Goalie Skills': [
        'Positioning & Arc Play',
        'Save Technique (High, Low, Stick Side, Off-Stick)',
        'Clearing & Outlet Passes',
        'Communication / Quarterbacking the Defense',
        'Shot Recognition & Anticipation',
        'One-on-One Situations'
      ]
    }
  },
  faceoffs: {
    title: 'FACE-OFFS',
    icon: '🏁',
    subcategories: {
      'Face-Off Technique': [
        'Clamp Technique', 'Plunger Technique', 'Rake Technique',
        'Counter Moves', 'Wing Play & Ground Ball Situations'
      ]
    }
  },
  fundamentals: {
    title: 'FUNDAMENTALS',
    icon: '📚',
    subcategories: {
      'Stick Skills': [
        'Cradling', 'Passing (Overhand, Sidearm)',
        'Catching (Stationary, On the Move)', 'Ground Balls',
        'Stick Protection', 'Weak Hand Development'
      ],
      'Field Awareness': [
        'Spacing', 'Field Vision', 'Off-Ball Awareness',
        'Reading the Defense/Offense'
      ],
      'Conditioning & Movement': [
        'Change of Direction', 'Acceleration & First Step',
        'Game Speed vs Practice Speed'
      ]
    }
  },
  team: {
    title: 'TEAM CONCEPTS',
    icon: '👥',
    subcategories: {
      'Game Management': [
        'Possession & Shot Clock Awareness',
        'Substitution Patterns / On-the-Fly Subs',
        'End of Game Situations',
        'Playing with a Lead / Coming from Behind'
      ],
      'Transition': [
        'Early Offense Recognition',
        'Defensive Transition',
        'Ride vs Clear Decision Making'
      ],
      'Communication': [
        'Defensive Calls (Ball, Two, Fire, etc.)',
        'Offensive Calls & Audibles',
        'Goalie Communication'
      ]
    }
  }
};

// ============= GIRLS TAXONOMY =============
const GIRLS_TAXONOMY = {
  offense: {
    title: 'OFFENSE',
    icon: '⚔️',
    subcategories: {
      'Settled Offense': [
        'Drive & Dish', { name: 'Behind-the-Cage Offense', active: true },
        '2-3-2 Formation', 'Pick Plays (girls rules on screens)',
        'Give & Go', 'Ball Movement & Reversal'
      ],
      'Dodging': [
        'Speed Dodge (no contact environment)', 'Roll Dodge',
        'Face Dodge', 'Change of Direction Dodge', 'Pull Shot Dodge', 'Sword Dodge'
      ],
      'Off-Ball Movement & Cutting': [
        'Cutting to Space', 'Back-Door Cuts',
        'Timing Cuts off Ball Movement', 'Creating Angles'
      ],
      'Shooting': [
        'Overhand Shot', 'Sidearm Shot',
        { name: 'Free Position Shots (8-Meter)', active: true },
        'On-the-Run Shooting', 'Shot Placement & Accuracy',
        'Shooting Under Pressure'
      ],
      'Transition Offense': [
        { name: 'Fast Breaks', active: true },
        'Numbers-Up Situations (3v2, 4v3)',
        'Draw Control to Fast Break Connection', 'Outlet Passing'
      ],
      'Player-Up Offense': [
        'Rotation Sets', 'Ball Movement Principles', 'Shot Selection'
      ]
    }
  },
  defense: {
    title: 'DEFENSE',
    icon: '🛡️',
    subcategories: {
      'Team Defense': [
        'Slides & Recovery', 'Zone Defense Principles',
        'Man-to-Man Marking', 'Double Teams', 'Communication Calls'
      ],
      'Individual Defense': [
        'Positioning & Footwork', 'Channeling / Forcing Direction',
        'Stick Positioning (3-Second Rule Awareness)',
        'Interceptions & Anticipation', 'Legal Checking Technique'
      ],
      'Defensive Transition': [
        'Recovery Runs', 'Preventing Fast Breaks', 'Numbers Back Principles'
      ]
    }
  },
  draws: {
    title: 'DRAW CONTROLS',
    icon: '◯',
    subcategories: {
      'Draw Technique': [
        { name: 'Draw Technique', active: true },
        'Wing Play & Positioning',
        'Set Plays Off the Draw',
        'Ground Ball Situations Post-Draw'
      ]
    }
  },
  goalie: {
    title: 'GOALIE',
    icon: '🥅',
    subcategories: {
      'Goalie Skills': [
        'Positioning & Arc Play', 'Save Technique',
        'Clearing & Outlet Passes',
        'Communication & Directing the Defense',
        'Free Position Save Technique'
      ]
    }
  },
  fundamentals: {
    title: 'FUNDAMENTALS',
    icon: '📚',
    subcategories: {
      'Stick Skills': [
        'Cradling (women\'s pocket rules)', 'Passing Accuracy',
        'Catching on the Move', 'Ground Balls', 'Weak Hand Development'
      ],
      'Field Awareness': [
        'Spacing & Spreading the Field', 'Field Vision',
        'Reading Defensive Setups'
      ]
    }
  },
  team: {
    title: 'TEAM CONCEPTS',
    icon: '👥',
    subcategories: {
      'Game Strategy': [
        'Draw Control Strategy', 'Transition Game Management',
        'Communication Systems', 'Late-Game Situations'
      ]
    }
  }
};

// ============= CONCEPT TEACHING CONTENT =============
// Full tiered coaching notes for active concepts
const CONCEPT_CONTENT = {
  "boys": {
    "Overhand Shot": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "The overhand shot is the most important shot to learn. You throw the ball over your shoulder, just like a strong overhand pass — but harder and right at the net!",
        "points": [
          "Top hand near the middle of the stick",
          "Step toward the goal with your opposite foot",
          "Follow through so your stick points at the corner"
        ],
        "activity": "Stand 8 yards out and shoot 20 overhand shots at the corners of an empty net. Count how many hit the pipe area."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "A good overhand shot comes from your whole body, not just your arms. Get your hands up and away from your body, transfer your weight from back foot to front foot, and snap the top hand down through the shot. Overhand keeps the ball on cage and lets you change planes.",
        "points": [
          "Athletic stance, knees bent, opposite shoulder to goal",
          "Hands 10-12 inches apart, up and away (no T-Rex arms)",
          "Step into the shot — weight back to front",
          "Snap top hand, pull bottom hand",
          "Follow through past your knee"
        ],
        "mistakes": "Alligator arms (hands in tight to the body), pushing with only the top hand, no weight transfer, dropping the elbow so the shot sails high."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite overhand shooters generate velocity through rotational power — the same as a pitcher or a hitter. Watch how the shooter coils the hips and core, then unwinds with the stick lagging behind before the snap. The overhand release lets you change planes (high-to-low, low-to-high) which is the hardest thing for a goalie to read.",
        "points": [
          "Rotational power from hips and core, not just arms",
          "Lag the stick, then snap top hand through",
          "Change planes to beat the goalie's read",
          "Keep hands high and extended for max speed",
          "Place the shot away from the goalie's stick (low far pipe)"
        ],
        "filmCues": "Watch the hips fire before the hands. Notice how the best shooters keep a consistent overhand look so the goalie cannot tell placement until the ball is gone."
      }
    },
    "Time & Room Shooting": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A time and room shot is when nobody is guarding you, so you have time and room to wind up and shoot a strong shot. Catch it, step, and rip it!",
        "points": [
          "Catch the ball ready to shoot",
          "Take a step toward the goal",
          "Wind up and shoot hard at a corner"
        ],
        "activity": "Have a coach or friend pass to you at 10 yards. Catch, take one step, and shoot. Do 15 each hand."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Time and room shots are the bulk of your outside scoring. The key is catching the ball already loaded — hands back and ready — so you can shoot in one motion. Use a crow hop or step-down to build momentum toward the net before you release.",
        "points": [
          "Catch with hands already back and loaded",
          "Build momentum with a step-down or crow hop",
          "Shoot in one fluid motion, not two",
          "Drive your momentum toward the net, not the end line",
          "Pick a corner before the ball arrives"
        ],
        "mistakes": "Catching flat-footed then re-setting, fading away from the goal, telegraphing the shot, taking too long so the slide arrives."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "At the highest level, time and room is about footwork and deception more than arm strength. Watch how shooters use a drift or a hitch to manipulate the goalie before the release. The best ones catch loaded and get the shot off in one-two-three steps so the recovering defender or slide never gets a stick on it.",
        "points": [
          "Catch loaded — eliminate the windup",
          "Use drift/hitch footwork to move the goalie",
          "Release in 1-2-3 steps before the slide arrives",
          "Change planes and hide the release point",
          "Shoot to the far low pipe off momentum"
        ],
        "filmCues": "Watch the feet, not the stick. Elite time-and-room shooters are already loaded as the pass arrives and their momentum carries into the cage."
      }
    },
    "On-the-Run Shooting": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "On-the-run shooting is shooting while you are moving, usually after a dodge. You do not stop — you shoot as you run toward the goal!",
        "points": [
          "Keep running toward the net",
          "Get your hands away from your body",
          "Shoot as your front foot lands"
        ],
        "activity": "Run from up top toward the goal and shoot without stopping. Try to keep your speed all the way through the shot."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "On-the-run shooting turns a beaten defender into a goal. The trick is to keep your speed and run AT the net, not across it or away from it. Get your hands out and shoot off your momentum — your legs give you the power.",
        "points": [
          "Keep your speed through the shot",
          "Run toward the net (turn the corner), not the end line",
          "Hands out and away from the body",
          "Shoot as the front foot plants",
          "Finish at the far pipe"
        ],
        "mistakes": "Slowing down to shoot, fading toward the end line, rolling out after the release, dropping the hands in tight."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite on-the-run shooting is about \"turning the corner\" — getting your hips and momentum pointed at the cage so a straight line opens to the net. Watch how attackmen run at the back pipe to give themselves the whole goal to shoot at, and how they get the shot off before rolling out or losing their line.",
        "points": [
          "Turn the corner — hips and momentum to the cage",
          "Run to the back pipe to open the full net",
          "Get the shot off before you roll out",
          "Use the hitch to re-create separation on the run",
          "Change the release height while moving"
        ],
        "filmCues": "Watch where the shooter ends up — running AT the net, not drifting to the end line. The corner turn is what separates good from elite."
      }
    },
    "Quick Stick / Catch & Shoot": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Quick stick is catching and shooting in one motion without cradling — the ball barely touches your stick before it is gone. It is great for finishing passes near the goal!",
        "points": [
          "Soft hands to catch",
          "Do not cradle — redirect it",
          "Snap it right back at the net"
        ],
        "activity": "Wall ball: throw against the wall and catch-and-throw in one motion without cradling. Build up speed as you get comfortable."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Quick stick (one-touch catch-and-shoot) is how you beat a goalie before they can slide across. The ball comes in, you give a little with soft hands, and redirect it on net in one motion. It is most dangerous on the crease and off ball reversal.",
        "points": [
          "Soft hands — give slightly on the catch",
          "No cradle — redirect in one motion",
          "Have your stick ready before the pass arrives",
          "Aim to the open side away from the goalie",
          "Keep two hands on the stick for control"
        ],
        "mistakes": "Cradling before shooting (too slow), stabbing at the ball with hard hands, not having the stick ready, shooting into the goalie's body."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Quick-stick finishing punishes a defense in rotation. The goalie is moving across the cage, so a one-touch redirect to the far, open side is a near-automatic goal. Elite finishers pre-set their stick to the catch point and read the goalie's momentum to pick the side before the ball even arrives.",
        "points": [
          "Pre-set the stick to the incoming pass",
          "Read the goalie's momentum, finish to the open side",
          "One-touch — never cradle in tight",
          "Catch-and-finish off skip passes and reversals",
          "Soft hands absorb pace, then redirect"
        ],
        "filmCues": "Watch the off-ball finisher's stick — it is already up and ready before the feed. The goal is decided by stick prep, not hand speed."
      }
    },
    "Shot Placement & Accuracy": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Placement means picking a spot in the net — usually a corner — and hitting it. A well-placed shot beats a hard shot that misses! Aim small, miss small.",
        "points": [
          "Pick a corner before you shoot",
          "Point your follow-through at the spot",
          "Low corners are hardest for the goalie"
        ],
        "activity": "Hang a target (or use cones) in each corner of the net. Shoot 20 and count how many hit a target. Beat your score next time."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Accuracy comes from your top hand and your follow-through, not raw power. Point the butt-end of your stick and your follow-through at the exact spot you want to hit. The low corners and the off-stick hip are the highest-percentage places to shoot.",
        "points": [
          "Aim with the top hand and follow-through",
          "Point the butt-end at your target",
          "Shoot low corners and off-stick side",
          "Practice one-handed for accuracy, add the second hand for power",
          "Hit the spot before you add velocity"
        ],
        "mistakes": "Shooting as hard as possible with no target, opposite-hand follow-through that pulls the ball, aiming center where the goalie is set."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite accuracy is about reading the goalie and changing planes. Shooters identify whether the keeper is a righty or lefty and attack the harder save (low off-stick, or stick-side hip). Changing the plane of the release — high-to-low, low-to-high — forces the goalie to move their whole body and opens placement windows.",
        "points": [
          "Read the goalie's hands and set position",
          "Attack the low off-stick and stick-side hip",
          "Change planes to force a full-body save",
          "Hide the release so placement is late",
          "Aim small — pick a pipe, not \"the net\""
        ],
        "filmCues": "Watch the shooter's eyes and the goalie's positioning. Great shooters take what the goalie gives — they do not force the same shot every time."
      }
    },
    "Shot Fakes & Deception": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A shot fake is pretending to shoot to make the goalie move, then shooting somewhere else. Show the ball high, then shoot low — trick the goalie!",
        "points": [
          "Show the goalie the ball like you will shoot",
          "Make the fake look real",
          "Then shoot to the open spot"
        ],
        "activity": "Practice a shot fake high, then a quick shot low, against a goalie or rebounder. Make the fake look exactly like a real shot."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Deception freezes defenders and goalies. A good shot fake uses the same motion as your real shot so it is believable, and you keep two hands on the stick so you can shoot right after. Head fakes and look-offs work the same way — sell one thing, do another.",
        "points": [
          "Make the fake identical to your real shot",
          "Keep two hands so you can finish quickly",
          "Fake high, finish low (or vice versa)",
          "Use head fakes and look-offs off the dodge",
          "Do not over-fake — one good fake beats three"
        ],
        "mistakes": "Fakes that look nothing like a shot, dropping a hand so you cannot finish, faking so long the slide arrives, telegraphing the real shot."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite deception is subtle — the goalie cannot tell pass from shot from fake until it is too late. Watch how shooters keep an identical setup and use the hitch (a fake-shot/re-dodge) to freeze a recovering defender and re-create a shooting lane. The goal is to make the goalie commit first.",
        "points": [
          "Identical setup for pass, shot, and fake",
          "Use the hitch to freeze defenders and re-dodge",
          "Eyes and shoulders sell the deception",
          "Make the goalie commit, then finish opposite",
          "Hide intent until the last instant"
        ],
        "filmCues": "Watch the goalie bite. Great deception is small — a head turn, a stick dip — not a giant windup. The keeper moves before the real shot is gone."
      }
    },
    "On-Ball Footwork & Positioning": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Defense starts with your feet. Stay in front of your man with short, quick steps and keep your body between them and the goal. Do not cross your feet!",
        "points": [
          "Stay low in an athletic stance",
          "Short, quick shuffle steps",
          "Body between your man and the goal"
        ],
        "activity": "Mirror drill: face a partner and shuffle side to side staying in front of them for 20 seconds. No crossing your feet."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Good on-ball defense is drop steps and kick steps, not lunging. Keep a cushion between you and the dodger, stay in a low athletic stance, and move your feet to keep your hips square so the attacker cannot get a step on you. Your feet keep you in front; your stick is secondary.",
        "points": [
          "Low athletic stance, weight on the balls of your feet",
          "Drop step and kick step — never cross over",
          "Keep a cushion (do not over-commit)",
          "Hips square, mirror the dodger",
          "Feet first, stick second"
        ],
        "mistakes": "Crossing the feet, lunging/over-committing with the stick, standing too tall, watching the stick instead of the hips."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite on-ball defenders win with footwork and angles. Watch how they use the kick step and drop step to stay topside and force the dodger into help, all while keeping their feet under them. They mirror the attacker's hips (not the stick) and never give up the inside hand.",
        "points": [
          "Kick/drop steps to maintain topside angle",
          "Mirror the hips, not the stick or head fakes",
          "Force the dodge toward your help/slide",
          "Keep feet under you to recover after the first move",
          "Take away the inside hand and the roll-back"
        ],
        "filmCues": "Watch the defender's feet stay under them through the dodge. They funnel the attacker to a predetermined spot rather than just reacting."
      }
    },
    "Approach Technique": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "When you run at the player with the ball, you cannot sprint right up to them or they will blow by you. Break down — slow down with quick choppy steps — as you get close.",
        "points": [
          "Sprint partway, then break down",
          "Choppy steps as you get close",
          "Stay low and balanced"
        ],
        "activity": "Practice running at a cone, then breaking down into short choppy steps the last few yards without stopping fully."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "A controlled approach is the difference between good defense and getting beat clean. Use the ABCDs: Approach under control, Break down into choppy steps, get in a defensive stance, and be ready to run with the dodge. Approach at an angle that takes away the attacker's strong hand.",
        "points": [
          "Approach under control — do not sprint in straight",
          "Break down with choppy steps near the ball",
          "Approach on an angle to take away the strong hand",
          "Stay low, stick in the passing/dodging lane",
          "Be ready to flip and run on the dodge"
        ],
        "mistakes": "Sprinting all the way in and getting beat, approaching straight on (gives both hands), standing straight up, over-extending the stick on the approach."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "The approach sets up the entire matchup. Elite defenders vary a shallow vs. deep drop-step approach to cut down the dodger's shooting room and dictate which way they go. They flow out under control, square the chest, and use the feet to absorb contact rather than reaching.",
        "points": [
          "Vary shallow vs. deep approach to cut shooting room",
          "Square the chest, absorb contact with the feet",
          "Dictate direction — force to help, not to the cage",
          "Arrive balanced, ready to change direction",
          "Stick in the lane without lunging on the approach"
        ],
        "filmCues": "Watch the approach angle. Elite defenders decide where the dodger is allowed to go before contact, then funnel them there."
      }
    },
    "Body Positioning & Leverage": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Use your body, not just your stick, to stop a dodger. Stay low and strong so you can hold your ground when they try to push past you.",
        "points": [
          "Stay low — lower than the attacker",
          "Strong base, feet shoulder-width",
          "Use your body to hold your spot"
        ],
        "activity": "Get in a low stance and have a partner gently try to push past your shoulder. Practice holding your ground with your feet, not your hands."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Leverage means staying lower than the dodger so you can absorb their drive and hold position. Use a butt-end hold or a V-hold to control the matchup without fouling, and keep your hips between the attacker and the goal. Whoever is lower and more balanced wins the contact.",
        "points": [
          "Stay lower than the attacker — win the leverage",
          "Butt-end hold or V-hold to control, not push",
          "Hips between the man and the goal",
          "Absorb the drive with a strong base",
          "Move the feet to maintain position after contact"
        ],
        "mistakes": "Standing tall and getting bumped off, pushing/shoving (penalty), reaching with the stick and losing the feet, leaning instead of staying balanced."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "At the top level, leverage is \"winning the contact at GLE.\" Elite defenders sit down low, accept contact like taking a charge, and use a controlled butt-end hold to ride the attacker away from the cage. They know when to hold vs. when to play with the feet, and they never let the dodger get their hips downhill to the goal.",
        "points": [
          "Win the contact at GLE — sit low, accept it",
          "Butt-end hold vs. V-hold by situation",
          "Never let the attacker get hips downhill",
          "Ride the dodger off the rail away from goal",
          "Stay legal — control with leverage, not pushes"
        ],
        "filmCues": "Watch the defender's base on contact. They are lower than the attacker and move them off their line without a penalty — feet and leverage, not arms."
      }
    },
    "Trail Technique": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Sometimes the attacker gets a step on you. Do not give up! Trail technique is how you chase from behind and still make a play with your stick.",
        "points": [
          "Keep running — do not quit on the play",
          "Catch back up to their hands",
          "Time your check as they wind up"
        ],
        "activity": "Have a partner get a half-step on you, then practice sprinting to recover position and lightly tapping their bottom hand."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "When you get beat, the trail check buys you time. Recover by sprinting to get back even, then time a low-to-high lift or trail check on the attacker's bottom hand as they go to shoot. Use the crease and the goalie as your help while you recover.",
        "points": [
          "Recover position first — sprint to get even",
          "Time the trail check as they wind up to shoot",
          "Low-to-high lift on the bottom hand",
          "Use the crease/goalie as help while recovering",
          "Do not swing wildly — one timed check"
        ],
        "mistakes": "Giving up when beaten, chopping at the stick from behind (penalty), losing the angle to the cage, swinging early before the shooter loads."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite defenders treat getting beat as recoverable. Watch how they ride the rail off the crease, cut the angle to the cage, and stay patient for the rollback or the shot windup before applying a clean trail check. Trail position is a skill, not a panic — the recovery angle matters more than the check itself.",
        "points": [
          "Ride the rail off the crease to cut the angle",
          "Be patient for the rollback or shot windup",
          "Recover the angle to the cage first, check second",
          "One clean low-to-high trail check, stay legal",
          "Trust the goalie/help while you recover"
        ],
        "filmCues": "Watch the recovery angle, not the check. The best defenders cut off the attacker's line to the net before they ever reach for the trail check."
      }
    },
    "Rotation Packages": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "When your team is a man down (someone is in the penalty box), the defense has to share jobs and move together as the ball moves. Everyone slides over to cover.",
        "points": [
          "You are missing a player — work together",
          "Slide to the ball as it moves",
          "Talk so nobody is left open"
        ],
        "activity": "With 5 defenders vs. a coach moving a ball around, practice everyone shifting one spot toward the ball each pass."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Man-down defense uses a set rotation so five players cover six. The most common is a five-man rotation (or a box-and-one / diamond): the on-ball defender pressures, and everyone else rotates to fill the most dangerous spots — crease and adjacent. Calls drive the rotation: ball, adjacent, backside.",
        "points": [
          "Five cover six with a set rotation",
          "Cover the most dangerous space (crease) first",
          "Rotate on the pass: ball, adjacent, backside",
          "Lock off / face-guard the hottest shooter",
          "Constant communication drives the slides"
        ],
        "mistakes": "Chasing the ball and leaving the crease open, rotating late, two players covering the same man, going silent."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite man-down units run multiple packages (5-man rotation, box-and-one, diamond) and disguise them. Watch how the package collapses to the ball as it swings while the backside rotates to fill the crease, and how they sell out to take away the offense's primary EMO action. Recognition and timing beat athleticism here.",
        "points": [
          "Multiple packages: rotation, box-and-one, diamond",
          "Collapse to the ball, fill the crease on the backside",
          "Take away the offense's primary EMO action",
          "Time the rotation to the pass, not the catch",
          "Disguise the package pre-possession"
        ],
        "filmCues": "Watch the backside defender, not the ball. In a good rotation the crease is always filled before the skip pass arrives."
      }
    },
    "Pressure vs Contain": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "On man-down defense your team decides: do we chase and pressure the ball, or sit back and protect the goal? Listen to your coach and do it together.",
        "points": [
          "Pressure = chase the ball hard",
          "Contain = sit back and protect the middle",
          "Everyone does the same thing together"
        ],
        "activity": "Practice both as a unit: one rep pressuring every pass, one rep sitting back. Notice how the offense reacts differently."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Pressure vs. contain is the man-down game plan. Pressure (push P) means hands on every pass to force errant throws and run the clock; contain means sitting in your shape and protecting the crease for a good shot. Most units mix it — contain until the offense gets sloppy, then pressure to force a turnover.",
        "points": [
          "Pressure = hands on every pass, force errors",
          "Contain = hold your shape, protect the crease",
          "Match the choice to the score and clock",
          "Pressure runs clock late in the penalty",
          "Whole unit commits to the same call"
        ],
        "mistakes": "Half the unit pressures while half contains (gaps open), pressuring and leaving the crease, never pressuring so the offense gets a clean look."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Top man-down units read when to flip from contain to pressure. Watch how they sit in a 5-man/house base, then \"push P\" — pressure hands on every pass — to force an errant throw on the penalty kill, especially as the clock winds down. The trigger is offensive indecision and the shot clock, not panic.",
        "points": [
          "Sit in a house/5-man base, then push P on the trigger",
          "Pressure hands force errant EMO passes",
          "Use pressure to run the penalty clock",
          "Read offensive indecision as the trigger",
          "Recover crease coverage immediately after pressure"
        ],
        "filmCues": "Watch the unit flip from contain to pressure on a single call. The pressure is timed to the swing pass and the shot clock, not random."
      }
    },
    "Split Dodge": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A split dodge is when you switch hands while changing direction to get past a defender. Think of it like a basketball crossover!",
        "points": [
          "Plant one foot hard",
          "Switch the stick to your other hand",
          "Explode in the opposite direction"
        ],
        "activity": "Get a ball and practice switching hands while running in a straight line. Then add a cone and practice dodging around it."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The split dodge uses a hard plant-and-switch at the point of attack. The key is selling the initial direction before exploding the opposite way. Watch the attackman's hips — that's what commits the defender.",
        "points": [
          "Approach at game speed with head up",
          "Show the defender you're going one way (commitment step)",
          "Plant the outside foot hard",
          "Switch hands at hip level, not overhead",
          "Accelerate away from the defender"
        ],
        "mistakes": "Switching hands too high (stick exposed to checks), not committing to the initial direction, switching too early."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Watch how the X attackman in this film sets up the split dodge with a hesitation step to freeze the defender's hips. The hand switch happens at the hip-height plane, not overhead, keeping the stick protected. Notice how the dodge is initiated from 5 yards above GLE to create a shooting angle.",
        "points": [
          "Use hesitation step to manipulate defender's momentum",
          "Hand switch in plane of hips keeps stick safe from checks",
          "Dodge from high position (5+ yards GLE) to keep shot ready",
          "Timing the dodge with off-ball movement creates passing lanes",
          "Reading slide defense — when to shoot vs when to pass"
        ],
        "filmCues": "Watch foot placement and hip rotation. Elite attackmen use minimal stick movement and maximum body deception. Study how the defender's eyes lock onto the initial direction."
      }
    },
    "Backdoor Cuts": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A backdoor cut is when you run behind your defender to get open. You fake like you're going one way, then cut behind them for an easy catch and score!",
        "points": [
          "Get your defender's attention",
          "Quick cut behind them",
          "Be ready to catch and shoot"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The backdoor cut exploits overplaying or poor positioning. You need timing between the cutter and the passer. The cut should happen when the ball is in flight or just after a pass.",
        "points": [
          "Establish position (face your defender)",
          "Make a fake move to draw their attention",
          "Explode cut behind them to the goal line",
          "Time your movement with passer's release",
          "Finish with shot or pass"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "The backdoor cut is a high-efficiency offensive action. It's effective against tight man-to-man coverage. The passer must recognize the cutting opportunity and the cutter must explode at the right moment to stay onside and get shot off before slide.",
        "points": [
          "Read defender positioning and proximity",
          "Use contact (shoulder) to establish space",
          "Timing relative to ball movement, not defender",
          "Sequence backdoor cuts with other offensive actions",
          "Recognize when slide is coming and reset"
        ]
      }
    },
    "Fast Breaks (4v3, 3v2)": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A fast break is when your team gets more players down the field than the other team. It's a great chance to score! Run fast, pass the ball, and shoot.",
        "points": [
          "More attackers than defenders = fast break",
          "Run down the field quickly",
          "Pass to the open player",
          "Get a good shot"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Fast breaks win games. In a 4v3, use spacing and ball movement to create a shot before the defense can set. The middle player is usually the best shot-taker. Kick out to shooters on the edges if defense collapses.",
        "points": [
          "One player in the middle (primary shot)",
          "Two wings (outlet options)",
          "One trailer (insurance / secondary break)",
          "Pass to open player, don't dribble unnecessarily"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Fast breaks are the most efficient offensive action. Execute with minimal touches before shot. In 4v3, the middle attackman should shoot within 2 passes. Recognize when the 4th attacker can leak out. 3v2 situations require one-touch passes and immediate shooting.",
        "points": [
          "Inside position (closest to goal) takes the shot",
          "Shot within 2 passes in 4v3",
          "3v2 one-pass shot rule",
          "Read defense for skip passes",
          "High-efficiency looks only (don't settle)"
        ]
      }
    },
    "Adjacent Slides": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "When the person with the ball dodges toward you, you \"slide\" — you run over to stop them. Your teammate then slides down to cover the person you were guarding. It's like passing your player to your teammate!",
        "points": [
          "Defender 1 slides to the ball",
          "Defender 2 slides to Defender 1's player",
          "Keep sliding until everyone is covered"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Adjacent slides are the foundation of team defense. When a dodge happens, the closest defender slides to ball while their adjacent neighbor rotates down. Communication is critical — loud, clear calls keep everyone connected.",
        "points": [
          "Identify the dodge direction early",
          "Slide defender angles hard to the ball carrier",
          "Adjacent defender reads and rotates",
          "Call out player (\"Ball!\" or \"Two!\")",
          "Recover to tight coverage quickly"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Adjacent slides must happen in reaction to the dodge, not in anticipation. Read the shoulder and hip commitment of the dodger. The slide defender must take away the space angle while adjacent defender reads the open attackman and closes out high. Wall the ball carrier off from shooting area.",
        "points": [
          "Slide angle depends on GLE proximity (steeper near goal)",
          "Adjacent defender gap responsibility before rotating",
          "Backside recovery — don't over-commit on slide",
          "Read skip passes during slide rotations",
          "Tempo of slides must match dodge speed"
        ]
      }
    },
    "10-Man Ride": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A ride is when your team is spread out across the field trying to stop the other team from clearing the ball. Everyone helps!",
        "points": [
          "Defense stays spread out after a goal",
          "Try to force bad passes",
          "Get the ball back quickly"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "A 10-man ride uses all field players to pressure the clear. Space riders to force sideline clears or turnovers. High pressure on the ball carrier while other riders cover passing lanes.",
        "points": [
          "Two crease attackers pressure ball",
          "Two mid-field riders pressure midfield passing lanes",
          "Two wing riders cover sideline",
          "Remaining players back-fill the clear",
          "Goalie directs traffic"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "10-man rides are high-risk, high-reward. They work best after goals when the clearing team is reactive. Set up to force specific areas (sidelines) and sequence pressure so riders can recover.",
        "points": [
          "Channel to sideline, not middle",
          "Pressure point of attack at GLE",
          "Midfield riders cover slip passes",
          "Tempo: aggressive to forced mistakes or transition back",
          "Secondary break if turnover occurs"
        ]
      }
    },
    "Motion Offense": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Motion offense means everyone keeps moving! Nobody stands still. You pass and cut, making it really hard for the defense to keep up.",
        "points": [
          "Always move after you pass",
          "Cut to open space",
          "Keep the ball moving",
          "Don't stand and watch"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Motion offense is built on constant player and ball movement. The system creates natural mismatches and open shots through spacing, cutting, and ball reversal. Every player touches the ball.",
        "points": [
          "Pass and immediately cut or replace",
          "Fill vacated spots to maintain spacing",
          "Read the defense — cut to open space",
          "Ball reversal changes the defense's focus",
          "Attack when the defense is shifting"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "At the college level, motion offense creates advantages through disciplined spacing and movement patterns. The offense reads defensive positioning to determine whether to dodge, feed, or continue ball movement. Film study is critical — learn to read slide packages.",
        "points": [
          "Recognize slide tendencies from film",
          "Use ball reversal to shift defensive structure",
          "Attack during defensive rotation (not after)",
          "Two-man game concepts within motion framework",
          "Shot clock awareness — when to push vs when to reset"
        ],
        "filmCues": "Watch how top-side passes create dodge angles. Study how off-ball players time their cuts to coincide with the ball carrier's decision point."
      }
    },
    "Roll Dodge": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A roll dodge is when you spin past your defender. Plant your foot, turn your back to them, and roll around the other side — protecting the ball with your body the whole time.",
        "points": [
          "Plant your front foot toward the defender",
          "Turn your back and roll around them",
          "Keep the stick close to your body",
          "Come out the other side and accelerate to goal"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The roll dodge attacks at the point of contact. Sell going one direction, plant the lead foot, dip the inside shoulder, and spin off your defender. The stick switches hands during the roll to stay on the goal-side.",
        "points": [
          "Use after the defender commits — not before",
          "Inside foot plants, you roll over it",
          "Stick stays high and protected through the spin",
          "Come out facing the goal at full speed",
          "Best initiated at GLE level for shooting angle"
        ],
        "mistakes": "Rolling too early (defender hasn't committed), exposing the stick during the spin, slowing down on the exit."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite roll dodgers (Ryan Boyle, Mikey Powell) manipulate the defender into committing before the spin. Look for over-aggressive defenders — they re-pursue right into the roll. Used at X to set up shooting angles topside, or in midfield to escape pressure.",
        "points": [
          "Read defender momentum — roll exploits over-pursuit",
          "Stick switches hands at the apex of the roll",
          "Counter to the split — if defender expects east-west, roll back",
          "Inside foot pivot must be quick or check from behind ends the rep",
          "Combine with bounce shot or alley shot off the roll exit"
        ]
      }
    },
    "Face Dodge": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A face dodge is a quick fake — you bring the stick across your face like you're going to shoot, then keep running past the defender on the other side. No hand switch, just a quick stick fake.",
        "points": [
          "Run hard at your defender",
          "Pull the stick across your face quickly",
          "Don't switch hands",
          "Keep running and shoot or pass"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The face dodge sells a shot or fake. Stick crosses tight to the face — high enough that the defender bites on the shot, low enough you don't expose the ball. No hand switch keeps you in shooting position immediately.",
        "points": [
          "Fake must be sharp and short",
          "Stick crosses tight to your face — minimal exposure",
          "No hand switch (unlike split dodge)",
          "Read defender — face dodge works on aggressive close-outs",
          "Shoot or pass in 1 second after the dodge"
        ],
        "mistakes": "Pulling the stick too far across the body (slow recovery), telegraphing the dodge, exposing the ball to checks."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Face dodges work best at GLE or in EMO situations where the defender expects a shot. Mikey Powell and Kyle Harrison built signature looks off the face dodge — sell shot, dodge by, then re-elevate the shot. The non-dominant hand can rip a left-handed shot if needed.",
        "points": [
          "Best inside 8 yards or in EMO sets",
          "Defender's commitment to the fake is the read",
          "Quick double-fake (face into face) freezes elite defenders",
          "No-look pass option to crease attackman",
          "Combo: face dodge → split dodge keeps the defender guessing"
        ]
      }
    },
    "Crease Slides": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A crease slide is when the defender on the crease (in front of the goal) leaves their player to help stop the dodger. They run at the ball carrier first. Then everyone else covers the open player.",
        "points": [
          "Crease defender leaves their man",
          "Slides hard to the ball carrier",
          "Other defenders cover the now-open player",
          "Communicate loudly so everyone knows"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The crease slide is preferred when the dodger is dominant or the dodge is happening at GLE. The crease defender has the shortest path to the ball, so the slide arrives faster than an adjacent slide. Vulnerability: the crease attacker is now open for a feed.",
        "points": [
          "Crease defender slides to ball — shortest path",
          "Adjacent defender drops down to cover the crease",
          "Slide angle takes away the dodger's topside",
          "Communicate the slide (\"crease!\" or \"I'm hot\")",
          "Recover to a tight crease coverage when the ball moves"
        ],
        "mistakes": "Sliding too late (dodger already at GLE), leaving the crease attacker uncovered during recovery."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Crease slides are a counter-punch. You give up the crease initially to stop a dominant dodger. The recovery sequence has to be tight — original crease defender bumps to the dodger, adjacent defender covers crease, sometimes a long-pole rotates from backside. Bill Tierney made the crease slide the foundation of Princeton/Denver's defense.",
        "points": [
          "Used against dodgers who beat the adjacent slide consistently",
          "Slide angle: come from inside-out, not square",
          "Recovery sequence is the real test of the scheme",
          "Backside long-pole must read and rotate to cover crease",
          "Combine with hot-call communication to confuse the offense"
        ]
      }
    },
    "Two-Man Game": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A two-man game is when two players work together — one sets a pick (like a wall) and the other runs off it to lose their defender. Like the \"pick and roll\" in basketball.",
        "points": [
          "One player sets a pick (legal screen)",
          "Other player runs off the pick to get free",
          "Picker rolls toward the goal after",
          "Watch for the open shot or pass"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The two-man game creates four reads based on what the defense does: (1) defenders go OVER the pick — use it, (2) UNDER — pull back and shoot, (3) SWITCH — attack the mismatch, (4) HEDGE — pass to the rolling picker.",
        "points": [
          "Set the pick with feet planted, body sideways",
          "Dodger uses pick — runs shoulder-to-shoulder",
          "Read defense: over/under/switch/hedge",
          "Picker rolls to the goal after the dodge",
          "Communicate calls before and during"
        ],
        "mistakes": "Setting a moving pick (illegal), dodger going too wide of the pick, picker not rolling."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Hopkins runs the most sophisticated two-man game in college lacrosse — 3-4 picks per possession with re-picks, slip-picks, and ghost picks. Elite teams attack defenders by tendency: if a long-pole hedges, run the pick to force the switch.",
        "points": [
          "Re-pick: if first pick gets switched, set another immediately",
          "Slip pick: picker fakes pick and slides to goal",
          "Pick at GLE for highest-value shooting angle",
          "Read defender body language pre-pick",
          "Sequence multiple two-man actions to wear out defenders"
        ]
      }
    },
    "3-3 Zone": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A zone defense is when each defender guards an AREA of the field, not one player. In a 3-3 Zone, three defenders are up top and three are down low. You guard whoever comes into your zone.",
        "points": [
          "Guard an area, not a player",
          "3 defenders up top, 3 down low",
          "Talk loudly to pass players to teammates",
          "Stop dodges and force outside shots"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "BTB Boys runs the 3-3 Zone modeled after Wesleyan's 2018 D3 championship system. Each defender owns a zone, but you slide to ball pressure when needed. Communication is everything — the goalie is the quarterback.",
        "points": [
          "Stay in your zone unless ball comes to you",
          "Slide to ball pressure when defender beat",
          "Goalie directs traffic — listen for calls",
          "Force outside shots, take away crease",
          "Communicate every pass and cut"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "The Wesleyan 3-3 zone (originated from Jack Kaley at NY Tech) wins by removing the offense's best looks. Up-top defenders take away ball-side dodgers and skip passes. Low defenders own the crease and recover to shooters. Most offenses break a 3-3 with quick ball movement and skip passes — your communication and recovery has to be faster.",
        "points": [
          "3-3 splits the field into 6 quadrants",
          "Up-top defenders deny dodgers and skip lanes",
          "Low defenders protect crease, close out shooters",
          "Weak-side defender becomes a \"rover\" who reads and helps",
          "Communication > raw athleticism in zone D"
        ]
      }
    },
    "Bull Dodge": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A bull dodge is when you run straight at the defender and use your strength to power through. Lower your shoulder, drive your legs, and don't stop.",
        "points": [
          "Approach at full speed",
          "Lower your shoulder slightly",
          "Drive your legs hard",
          "Keep moving — don't stop on contact"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The bull dodge isn't just brute force — it's leverage and angle. Sell the dodge by accelerating directly at the defender, then drop your shoulder slightly inside their chest plate. Keep the stick away from their body to avoid a check. Best used by larger middies/attackmen at a downhill angle.",
        "points": [
          "Accelerate directly at defender — don't hesitate",
          "Lower the shoulder, lift the chest",
          "Stick on the far side, away from defender's reach",
          "Drive through — don't stop on contact",
          "Best from up top or wing positions"
        ],
        "mistakes": "Lowering the head (loss of vision and dangerous), exposing the stick to checks, slowing on contact."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite bull dodgers (Myles Jones, Dylan Molloy) combine size, speed, and angle. The bull is most effective when you've set up the defender with previous dodges — they expect a split or face dodge, then you bull through. Combine with a hesitation or shoulder fake to freeze the defender before contact.",
        "points": [
          "Set up the bull with prior dodges (split, face)",
          "Hesitation or shoulder fake before contact",
          "Drive toward GLE for shot angle",
          "Read the slide — kick out if help arrives",
          "Most dangerous from middies coming downhill"
        ]
      }
    },
    "1-4-1 Formation": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "The 1-4-1 is a way to set up your offense — 1 player at the top, 4 across the middle, and 1 behind the goal. The big middle gives the dodger lots of space to make plays.",
        "points": [
          "1 up top, 4 across middle, 1 behind",
          "Lots of space for dodgers",
          "Pass to your teammates around the perimeter",
          "Look for cuts to the goal"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Lars Tiffany's Virginia builds their offense around the 1-4-1 because the spread formation creates the longest possible slide distance. The dodger from up top or X has time to make reads. The 4 across the middle space the field, forcing defenders to choose who to slide to.",
        "points": [
          "Spread formation creates max slide distance",
          "Dodge from up top or X for best angles",
          "Wings on the perimeter, midfielders space the field",
          "Skip passes punish slow rotations",
          "Crease attackman picks for shooters"
        ],
        "mistakes": "Players bunched in the middle (kills spacing), wings drifting too high, no cutter when the dodge happens."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "The 1-4-1 is the modern lacrosse base set. Virginia under Tiffany, Notre Dame under Corrigan, and many top programs run it because it forces the defense to choose between covering the middle or the perimeter. Counter the 1-4-1 by running picks at GLE, having the X-attackman dodge, and using skip passes to the weak side. Best EMO formation as well.",
        "points": [
          "Foundation set for modern lacrosse offense",
          "Virginia Tiffany system uses it as the base",
          "Counter the slide with skip passes",
          "Use as EMO set with high overload",
          "Force defense to choose middle vs perimeter coverage"
        ]
      }
    },
    "Save Technique (High, Low, Stick Side, Off-Stick)": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A goalie's job is to stop shots. Different shots need different saves — high, low, stick side (where your stick is), and off-stick (the other side). Move your top hand straight at the ball.",
        "points": [
          "Move your top hand straight at the ball",
          "Step toward the shot with your lead foot",
          "Keep your chest behind the stick",
          "Ball stays in front — don't reach behind you"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Save technique is about quickness and angles. Top hand drives in a straight line to the ball. Lead foot steps in the direction of the shot. Different shots: high = chest up and stick high; low = drop knee and stick down; stick side = step laterally; off-stick = top hand cuts across the body.",
        "points": [
          "Top hand straight to ball (rattlesnake-quick)",
          "Lead foot steps to ball",
          "High: chest up, stick at shoulder height",
          "Low: drop the knee on the shot side",
          "Off-stick: top hand cuts across, don't sweep"
        ],
        "mistakes": "Reaching with the bottom hand, lunging forward (off-balance), pulling the head off the ball."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite goalies (John Galloway, Brian Phipps) react in 0.4 seconds — that requires read+execute, not think. Read the shooter's release point, hand position, and stick angle pre-shot. The \"cut the clock\" technique from PLL pro Brian Phipps for off-stick saves: top hand goes in a straight line, doesn't sweep around in a circle.",
        "points": [
          "Read release point and hand position pre-shot",
          "Anticipate but don't commit until release",
          "Off-stick: cut the clock (straight line, no sweep)",
          "Hip saves: drop and seal, don't reach",
          "Recovery to outlet pass within 1 second of save"
        ]
      }
    },
    "Clamp Technique": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A face-off is when two players battle at center for the ball. The clamp is the most common technique — when the whistle blows, push your stick down on the ball to lock it under your stick.",
        "points": [
          "Get low and balanced before the whistle",
          "On whistle: push stick down on the ball",
          "Lock the ball under the head of the stick",
          "Move it to a teammate or scoop it yourself"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Clamp technique: top hand drives down vertically, bottom hand pushes the opponent's stick away horizontally. The clamp must happen FAST — first move wins. After the clamp, you have to either pop the ball to a wing or scoop and run. Wing play after the clamp is half the battle.",
        "points": [
          "Top hand pushes down vertically",
          "Bottom hand pushes opponent horizontally",
          "Speed > strength on the clamp",
          "Pop the ball to a wing or scoop and protect",
          "Wings sprint to the ball — pre-determined direction"
        ],
        "mistakes": "Slow first move (lose the clamp), exposing the ball to the opponent's rake counter, getting too low and unable to react."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Trevor Baptiste, Greg Gurenlian, and TD Ierlan dominate face-offs with multiple counters off the clamp — clamp + pop, clamp + carry, clamp + jam. Reading the opponent's pre-whistle stance, hand position, and eyes tells you what they're going to do. Modern face-off: 60-70% win rate is elite. Tiebreaker: secondary skills (groundballs, wing play, exits).",
        "points": [
          "Read opponent's pre-whistle stance",
          "Multiple counters: clamp+pop, clamp+carry, clamp+jam",
          "Wing setups create predetermined exit lanes",
          "Ground ball recovery in the scrum is the deciding skill",
          "Conditioning matters — you might run 30+ FOs in a game"
        ]
      }
    },
    "Settled Clears": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A clear is when you carry the ball from your defensive end to your offensive end. The 2-3-2 clear has 2 players deep, 3 across the middle, and 2 forward. Break out and pass to teammates.",
        "points": [
          "Get out of your zone fast on possession",
          "Pass to teammates moving up the field",
          "Stay spread out — don't bunch",
          "Goalie can carry or pass to start the clear"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The 2-3-2 is the modern college clear. Goalie has the ball; defensemen break to the wings; midfielders fill the middle three spots; attackmen stretch the field. The clear succeeds with quick passes and movement, NOT with players standing still.",
        "points": [
          "2 attackmen stay deep",
          "3 middies across the middle",
          "Goalie + 2 D-poles initiate",
          "Pass and move — no standing",
          "Beat the ride within 8 seconds"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite teams clear above 90% by reading the ride and adjusting. Against a 10-man ride, the goalie may step out to relieve pressure. Against a press, slip a long-pole upfield. Against a zone ride, hit the seams. The 2-3-2 spreads the field and creates passing lanes — your tempo and spacing dictate success.",
        "points": [
          "Read the ride structure pre-clear",
          "Slip a defender upfield against zone ride",
          "Goalie can step out vs 10-man pressure",
          "Skip passes break zone rides fast",
          "Beat the 20-second clearing clock with rhythm"
        ]
      }
    },
    "Press Ride": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A press ride is when your team puts pressure on the other team while they try to clear. Each player guards their man closely. The goal is to force a turnover or bad pass.",
        "points": [
          "Each player guards one opponent",
          "Stay close, deny passes",
          "Force the goalie to keep the ball",
          "Pressure and turnovers!"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The press (man-to-man) ride matches each rider with one clearing player. Riders deny passing lanes and force the carrier to dodge. The goalie covers the deepest opponent or stays in goal. This ride works against teams that struggle to handle pressure.",
        "points": [
          "Match each rider to one opponent",
          "Deny passing lanes with stick out",
          "Force carrier to dodge",
          "Goalie covers deepest opponent",
          "Best vs teams with weak ball handlers"
        ],
        "mistakes": "Letting the rider get beat 1v1 (entire scheme breaks), failing to deny lanes, weak goalie support."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Press rides win when you have superior 1v1 athletes. Risk: one beaten rider = fast break. Modern variations include \"soft press\" (pressure to a side) and \"hot press\" (full deny). Use to disrupt rhythm against ball-control teams. Pair with sub schemes — bring fresh middies into the press.",
        "points": [
          "Use against teams that don't handle pressure well",
          "Soft press vs hot press variants",
          "Sub fresh middies into the ride",
          "Deny lanes — force the dodge",
          "Combine with situational adjustments per opponent"
        ]
      }
    },
    "Poke Check": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A poke check is when you stick out your lacrosse stick to \"poke\" the ball or your opponent's stick. It's like jabbing at them with your stick to knock the ball loose.",
        "points": [
          "Stick out, hit the bottom of the opponent's stick",
          "Quick jab — don't reach too far",
          "Pull stick back fast",
          "Don't lean off your feet"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The poke check is the highest-EV defensive check — lowest risk, highest reward. Push the stick out from a low position, target the opponent's gloves or bottom hand, and pull back fast. Stay in your stance — never reach so far you're off-balance. Use it to disrupt the dodger's rhythm.",
        "points": [
          "Target the gloves or bottom hand",
          "Push stick out from low position",
          "Pull back fast — never reach beyond your feet",
          "Use to disrupt rhythm, not always to dislodge",
          "Foundation check before any advanced check"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite defenders (Brodie Merrill, Jesse Bernhardt) build their entire defensive game off the poke check. The poke sets up everything else — defenders use it to disrupt the dodger, create checking opportunities, and force errors. Best when combined with footwork: poke and shuffle, never lunge.",
        "points": [
          "Poke to channel — direct the dodge to your help",
          "Combine with footwork: poke and shuffle",
          "Never lunge — stay over your feet",
          "Foundation for lift/slap/trail check sequences",
          "Time pokes with offensive moves (between dodges)"
        ]
      }
    },
    "Lift Check": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A lift check is when you use your stick to lift up your opponent's stick from underneath, knocking the ball loose. Perfect when they're about to shoot or you're behind them.",
        "points": [
          "Get under the bottom of their stick",
          "Lift up sharply with your stick",
          "Pull back fast",
          "Best when they're about to shoot"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The lift check is a follow-up to the poke check. After poking and disrupting the dodger, lift the bottom hand of their stick — this exposes the ball or knocks it loose. Lift checks work best when you're behind or beside the offensive player. Trail position = lift check setup.",
        "points": [
          "Set up with poke check first",
          "Target the bottom hand of opponent's stick",
          "Lift sharp and fast",
          "Best from trail position",
          "Pull back to maintain stance"
        ],
        "mistakes": "Trying to lift from in front (illegal contact risk), reaching too far, telegraphing the lift."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite defenders chain checks: poke → lift → take-away. Chad Wiedmaier (Princeton/PLL) made the lift his signature. Use the lift to dislodge during a player's shot motion or as a counter when you're trailing the dodge.",
        "points": [
          "Chain checks: poke → lift → take-away",
          "Lift during shot motion to disrupt release",
          "Counter check when trailing the dodger",
          "Body position: hips to goal, force dodger to help",
          "Avoid illegal slashing — clean lifts win games"
        ]
      }
    },
    "Outlet Passing": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "An outlet pass is the first pass after your team gets the ball back. The goalie or defender finds an open teammate and starts the clear. Quick outlet = fast break chance!",
        "points": [
          "First pass after a save or turnover",
          "Look for an open teammate",
          "Pass quick and accurate",
          "Start the clear or a fast break"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Outlet passing is the foundation of good clearing. After a save, the goalie has 4 seconds to start the clear. The first option is the closest D-pole breaking up the field. Long outlets to a midfielder can spark a fast break. The pass must be sharp and lead the receiver into space.",
        "points": [
          "Goalie has 4 seconds to start the clear",
          "First option: closest D-pole upfield",
          "Lead the receiver into space",
          "Long outlets create fast break opportunities",
          "Communicate the outlet target"
        ],
        "mistakes": "Holding the ball too long (4-second violation), passing into pressure, not leading the receiver."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite goalies (Brett Queener, Drew Adams) outlet within 1.5 seconds of save. The decision tree: (1) breakout D-pole = standard, (2) midfielder leak = fast break, (3) attackman cherry = home-run pass for instant scoring. Read the ride pre-save — know your outlet BEFORE you make the save.",
        "points": [
          "Decision within 1.5 seconds of save",
          "Pre-save read of the ride structure",
          "Three options: breakout, leak, cherry",
          "Long outlet to midfielder = fast break",
          "Outlet quality determines transition tempo"
        ]
      }
    },
    "Question Mark Dodge": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A question mark dodge is when you dodge from behind the goal in a curve shape — like the letter \"?\". You go wide, curve toward the goal, and shoot or pass.",
        "points": [
          "Start at X (behind the goal)",
          "Run in a curve shape (?)",
          "Get to the topside of the goal",
          "Shoot or pass when open"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The question mark dodge from X is the signature attack at GLE. Wide curl to the outside, then curve back toward the goal, ending in shooting position. The dodge creates separation by stretching the defender wide before cutting topside. Rob Pannell (Cornell, PLL) built his career on the question mark.",
        "points": [
          "Start the dodge wide and outside",
          "Curve back to the goal in a \"?\" shape",
          "Use one hand on the wide arc to maximize speed",
          "Switch hands as you cut topside",
          "Finish with shot or feed at GLE topside"
        ],
        "mistakes": "Going too wide (creates distance from goal), not switching hands to protect the stick, slowing on the curve."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "The question mark exploits aggressive defenders. Sell the wide dodge to commit the defender — they have to cover the wide angle — then curve back as they over-extend. Rob Pannell's version uses a hesitation step at the apex of the curve to freeze the defender further.",
        "points": [
          "Use against aggressive defenders who over-pursue",
          "Hesitation step at the apex freezes defenders",
          "Combine with crease pick for shot setup",
          "Best initiated 5+ yards above GLE",
          "Pannell signature — study his game film"
        ]
      }
    },
    "Slap Check": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A slap check is when you \"slap\" your stick down on your opponent's stick or hands to knock the ball loose. Quick, sharp, and short — no big windup.",
        "points": [
          "Quick chop on opponent's stick or hands",
          "No big windup — fast and short",
          "Aim for their bottom hand",
          "Pull stick back fast"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The slap check is a fast, disruptive check. Don't wind up — it telegraphs and exposes you. Quick chop straight down on the bottom hand or top of the stick. Best when the dodger is winding up to shoot or carrying loose. Pair with footwork — slap and shuffle.",
        "points": [
          "No windup — telegraphs the check",
          "Aim for hands or stick head",
          "Best when dodger is winding up to shoot",
          "Pair with footwork — slap and shuffle",
          "Quick recovery to defensive stance"
        ],
        "mistakes": "Big windup (illegal slashing risk), reaching too far, slapping the helmet (penalty)."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Ric Beardsley (Syracuse, 4x All-American) built a defensive identity around the slap check. Three variations: one-hand slap (quickest), two-hand slap (most disruptive), back slap (when trailing). Use slap to disrupt rhythm without committing — keep your hands free for poke checks.",
        "points": [
          "One-hand slap = fastest, lowest risk",
          "Two-hand slap = max disruption when set",
          "Back slap when trailing the dodger",
          "Disrupt without committing — keep poke option open",
          "Time slaps with shooter's wind-up"
        ]
      }
    },
    "Inside Roll": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "An inside roll is a roll dodge that goes TOWARD the goal — toward the inside, not the outside. You roll past the defender and end up right in front of the goal for a shot.",
        "points": [
          "Roll toward the goal (inside)",
          "Spin past your defender",
          "Stick stays protected",
          "Shoot or feed when you come out of the roll"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The inside roll is a roll dodge variation that finishes inside — closer to the goal. From X or wing, plant the foot toward the goal, roll your body inside, and come out facing the cage. Most effective when defenders over-pursue toward the alley.",
        "points": [
          "Plant foot toward the goal (not the sideline)",
          "Roll inside — toward the cage, not away",
          "Stick stays high and protected",
          "Come out facing the goal at GLE",
          "Best from X-attack or wing positions"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Inside rolls exploit defenders who push the dodger to the alley (away from the goal). Sell the alley dodge, then plant and roll inside — the defender over-commits to closing the alley and the inside roll catches them flat-footed. Mark Millon-style: quick inside roll into a shot at GLE.",
        "points": [
          "Sell the alley dodge first",
          "Read defender's commitment to closing the alley",
          "Inside roll surprises defenders pushing to sideline",
          "Shoot or feed within 1 second of the roll exit",
          "Combine with crease pick for shot setup"
        ]
      }
    },
    "Positioning & Arc Play": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A goalie's arc is an imaginary half-circle in front of the goal. You move around the arc to be in the right spot for the shot. When the ball is in the middle, you're in the middle. When it goes to the side, you slide that way.",
        "points": [
          "Stay on the arc, not flat on the goal line",
          "Follow the ball around the arc",
          "Be ready in your stance",
          "Don't move when the shooter is winding up"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The goalie arc is roughly 1-3 feet in front of the goal line in a semi-circle. Move around it as the ball moves — but DON'T move when the shooter is winding up or actively dodging. Less movement = more saves. Position takes away the most goal: cut off the angle.",
        "points": [
          "Arc is 1-3 feet in front of the goal line",
          "Move with the ball, not the shot",
          "Stop moving when shooter winds up",
          "Cut off the angle — be square to the ball",
          "Less movement = more saves"
        ],
        "mistakes": "Constantly stepping in place (out of position when shot comes), moving during a dodge, staying flat against the goal line."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite goalies (John Galloway, Brian Phipps) play a specific arc shape based on their style. Shallow arc = more time to react, less angle covered. High arc = less time, more angle taken. Adjust depth based on shot location: high arc on outside shots, drop deeper on inside shots and crease attackmen who can move laterally.",
        "points": [
          "Shallow arc = more reaction time, more angle to cover",
          "High arc = less reaction time, less angle to cover",
          "Depth varies by shot location",
          "High arc for outside shots, deeper for inside",
          "Five-point arc system for new goalies"
        ]
      }
    },
    "Wrap Check": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A wrap check is when you reach your stick AROUND the offensive player's body to hit their stick. It's like wrapping your arms around them to grab the ball.",
        "points": [
          "Reach around the dodger's body",
          "Aim for their stick or hands",
          "Keep your feet moving",
          "Don't reach so far you fall off-balance"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The wrap check works when you're trailing the dodger or beside them. Reach the stick around their body to make contact with their stick or bottom hand. Critical: keep moving your feet — wrap checks where you stop moving = beaten dodger. Best from a recovery position.",
        "points": [
          "Best from trail or beside position",
          "Aim for stick or bottom hand",
          "KEEP feet moving — never stop",
          "Pull stick back fast",
          "Recovery position required for legal wrap"
        ],
        "mistakes": "Stopping feet (dodger blows by), reaching too far (off-balance), hitting body (penalty)."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Wrap checks are advanced — risk/reward depends on timing. Kyle Hartzell built his game on wraps. Time the wrap with the dodger's commitment to the dodge — wrap as they extend toward the goal. Combine with butt-end hold (legal lock-up) to immobilize the offensive player without a slash.",
        "points": [
          "Time wrap with dodger's dodge commitment",
          "Combine with butt-end hold for lock-up",
          "Most effective in trail position",
          "Foot speed must match dodger's pace",
          "Risk: out of position if timing is off"
        ]
      }
    },
    "Toe Drag": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A toe drag is when you drag your stick under the defender's stick — instead of going around it. Tricky move that takes your stick away from where they're trying to check.",
        "points": [
          "Move your stick UNDER the defender's stick",
          "Quick drag, then explode away",
          "Stick stays low",
          "Best when defender goes for a check"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The toe drag is a hesitation/escape move. As the defender commits to a check, drop the stick low and drag it under their stick. This pulls your stick away from their check zone. Best when paired with a quick acceleration after the drag — the defender is checking air while you blow by.",
        "points": [
          "Drop stick low when defender commits to check",
          "Drag UNDER their stick",
          "Explode away after the drag",
          "Best vs aggressive checkers",
          "Hesitation timing is everything"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "The Canadian-style toe drag (popularized by Mark Matthews, Johnny Christmas) is a deception move. Sell the dodge one direction, drag the toe-drag escape the other way. Connor Martin and PLL pros chain face dodge → toe drag for double-deception. Risk: if not done properly, exposes the stick to a check.",
        "points": [
          "Combine with face dodge for double-deception",
          "Sell direction first, drag opposite way",
          "Canadian-style: build entire game around it",
          "Risk: improper drag = exposed stick",
          "Mark Matthews / Johnny Christmas signature"
        ]
      }
    },
    "Backside Rotation": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Backside rotation is when defenders move across the field to cover open players when their teammate slides. The \"backside\" is the side away from where the ball is. You watch the ball AND your player.",
        "points": [
          "Watch the ball AND your player",
          "Move across when teammate slides",
          "Cover the open player",
          "Communicate (\"two!\" \"three!\")"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "When the first slide goes to the ball, the backside player (furthest from the ball) rotates to cover the new open man. As the ball moves, the rotation continues — each pass changes who the backside player is. Communication is critical: each defender calls their new responsibility.",
        "points": [
          "Backside player = furthest from ball",
          "Rotates to cover after first slide",
          "Backside player CHANGES with each pass",
          "Communication: \"two!\" / \"three!\" calls",
          "Stick up in the passing lanes"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite defenses (Maryland, Virginia) chain rotations seamlessly. The backside player has TWO jobs: (1) read the ball-side dodge to anticipate slides, (2) read the cutter behind them to deny passes. Modern defense uses \"rover\" backside players who can jump passes, deny skip lanes, or rotate to crease. Backside reads start BEFORE the dodge.",
        "points": [
          "Read ball-side AND your assignment",
          "Anticipate slide need from ball-side dodge",
          "Modern rover-style backside players",
          "Deny skip passes from the weak side",
          "Backside reads start BEFORE the dodge happens"
        ]
      }
    },
    "Take-Away Checks": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Take-away checks are aggressive checks designed to get the ball — like a strip in basketball. You hit the offensive player's stick hard to knock the ball loose.",
        "points": [
          "Aggressive checks aimed at the ball",
          "Knock the ball loose",
          "Pick up the ball after",
          "Risk: if you miss, opponent has space"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Take-away checks are higher risk than poke or lift. Target the ball or stick when the opponent isn't protecting it — stick out wide, ball loose. Hit hard, recover fast. If you miss, you're out of position. Use against players who carry their stick exposed.",
        "points": [
          "Target ball or stick when exposed",
          "Hit hard, recover fast",
          "Best when opponent has stick out wide",
          "Risk: missing = open lane to goal",
          "Aggressive — read the opportunity"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite take-away artists (Brodie Merrill, Joe Walters) read offensive players for tendencies. They strip when the player carries the stick away from their body. Combine with body positioning — close the angle, then strip. Take-aways feed transition offense — every strip is a fast break opportunity.",
        "points": [
          "Read offensive tendencies for the strip",
          "Close angle before stripping",
          "Take-away → fast break transition",
          "High risk-reward — pick spots carefully",
          "Practice with film — see when stick is exposed"
        ]
      }
    },
    "Slide Recovery": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "After you slide to help, you have to RECOVER — get back to your player or the next open player. The team trades defensive jobs as the ball moves.",
        "points": [
          "Slide first, then recover",
          "Cover the next open player",
          "Communicate every move",
          "Get back to defensive position fast"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Slide recovery completes the defensive cycle. Once you slide to the ball, you must immediately recover to the next open offensive player. Adjacent defenders rotate down as you recover. Communication: announce your slide AND your recovery. Drills: line bump, triangle show, slide-and-recover circuit.",
        "points": [
          "Slide → recover sequence is one motion",
          "Adjacent defender bumps down on your slide",
          "Communicate slide AND recover",
          "Recover to the most dangerous open player",
          "Stick up in passing lanes during recovery"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite defenses chain slide recoveries seamlessly. The Salisbury and Triangle Show drills install the recovery footwork: every slide has a 1-2 second recovery window before the next pass. Bump and recover at game speed under pressure. Modern defense factors in skip pass threats during recovery — stick angle in passing lanes.",
        "points": [
          "1-2 second recovery window per slide",
          "Bump and recover at game speed",
          "Skip pass denial during recovery",
          "Salisbury/Triangle Show drills install footwork",
          "Practice with full 6v6 reps"
        ]
      }
    },
    "Communication & Calls": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Defense talks to each other A LOT. You yell out where the ball is, when there's a pick, when to slide. Loud, clear talk = good defense.",
        "points": [
          "Talk LOUD and CLEAR",
          "Call out the ball (\"ball!\")",
          "Call out picks (\"pick coming!\")",
          "Call out slides (\"slide!\" / \"I got him!\")"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The goalie is the defensive quarterback. They see everything and direct traffic. Standard calls: \"Ball!\" (where the ball is), \"Pick coming!\" (screen alert), \"Slide!\" / \"I got him!\" (defensive rotation), \"Two!\" (second slide), \"Hot!\" (you're the next slider). Practice the language until it's automatic.",
        "points": [
          "Goalie = defensive quarterback",
          "Standard calls: ball, pick, slide, two, hot",
          "Loud and continuous — never silent",
          "Use names when possible (\"Mike, you're hot\")",
          "Practice the language until automatic"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite defenses use 30-50 specific calls. Examples: \"Drive\" (defender on ball cannot give more ground), \"Hold\" (don't let your man advance), \"Goose it\" (clear it out), \"Flip it\" (switch matchups), \"Inside roll!\" (specific dodge call). Goalies know offensive sets BEFORE the dodge and call adjustments. Communication separates good defenses from championship defenses.",
        "points": [
          "30-50 specific calls in elite defenses",
          "\"Drive\", \"Hold\", \"Goose it\", \"Flip it\" examples",
          "Goalies anticipate sets pre-dodge",
          "Communication is constant, not occasional",
          "Championship defenses talk through every possession"
        ]
      }
    },
    "Trail Check": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A trail check is when you check from BEHIND the offensive player. You're trailing them — chasing — and reach your stick around to disrupt their stick or knock the ball loose.",
        "points": [
          "Used when you're behind the offensive player",
          "Reach around to their stick",
          "Aim for hands or stick",
          "Pull stick back fast — don't fall behind"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Trail checks come from a recovery position — you got beat or you're chasing the dodger. Reach the stick around their body to make legal contact with their stick. Trail checks must avoid checking from behind below the waist (illegal). Footwork is critical: you must keep up to legally trail.",
        "points": [
          "Used in recovery / chase position",
          "Legal contact above the waist only",
          "Keep feet moving — must keep up",
          "Aim for hands or stick head",
          "Recover stance after the check"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite trail checks come from defenders who match dodger speed. Joe Walters and Brodie Merrill build their game on the trail check. Modern trail checks integrate with the \"Trail to X\" technique: trail dodgers as they go to X, then run the rail when they cross GLE.",
        "points": [
          "Match dodger speed required",
          "Trail-to-X: trail then run the rail",
          "Combine with body angling",
          "Best at GLE during the dodge",
          "Avoid below-the-waist contact"
        ]
      }
    },
    "Press Break Clears": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "When the other team is pressing you (everyone guarding tight), you have to BREAK the press to clear the ball. Spread out, pass quickly, and find the open player.",
        "points": [
          "Spread out — don't bunch",
          "Quick passes around the press",
          "Find the open teammate",
          "Sometimes the goalie has to dodge"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Press break clears beat man-to-man rides. Key principles: (1) you have a 7-on-6 advantage with the goalie, (2) find the open midfielder upfield, (3) use the goalie as an outlet on slow rides. The 2-3-2 clear, 3-1-3 clear, and short-stick sideline clear all work against presses.",
        "points": [
          "7v6 advantage with goalie",
          "Find open midfielder upfield",
          "Use goalie as outlet",
          "2-3-2 vs 3-1-3 vs sideline clears",
          "Beat the 20-second clearing clock"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Modern teams shoot from the defensive zone to break heavy presses — long-shot scoring chances + clear-rhythm-breaking. Read the ride structure pre-clear: man-ride = run patterns, zone-ride = hit seams. Quick ball movement and skip passes break presses fastest.",
        "points": [
          "Defensive-zone shots as press-breakers",
          "Read ride structure pre-clear",
          "Quick ball movement + skip passes",
          "Goalie steps out vs 10-man",
          "Practice clears vs all common ride types"
        ]
      }
    },
    "1-4-1 EMO Set": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "When the other team has a player in the penalty box, you have an extra player on offense. The 1-4-1 EMO set spreads out — one up top, four across, one behind. The defense can't cover everyone!",
        "points": [
          "Extra man advantage when other team has penalty",
          "1 up top, 4 across, 1 behind goal",
          "Spread out — defense can't cover all 6",
          "Pass quick and look for shots"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The 1-4-1 EMO is the most common extra-man offense set. Spreads the defense across the field, forcing slides and creating shooting lanes. Classic action: ball at X feeds to a wing shooter, or top center pops to a crease attackman. Quick ball movement breaks down the 5-man defense.",
        "points": [
          "Most common EMO set",
          "Spreads the 5-man defense",
          "X feeds wings or top of crease",
          "Ball rotation > standing still",
          "Quick shot off the slide is the goal"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite EMO converts 40-45%. Sequence multiple actions: ball at X → skip to wing → wing dodge → kick to top → shot. UNC's \"1-4-1 with a Pop\" uses a high pop to free a shooter. Dave Cottle's Maryland made the 1-4-1 the standard. Read the man-down defense — adjust attack based on whether they slide adjacent or zone.",
        "points": [
          "Elite EMO conversion: 40-45%",
          "Sequence multiple actions per possession",
          "UNC's \"1-4-1 with a Pop\" variation",
          "Dave Cottle Maryland system",
          "Read man-down structure to choose attack"
        ]
      }
    }
  },
  "girls": {
    "Positioning & Footwork": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Defense starts with your feet. Stay low, take small quick steps, and keep your body between your player and the goal. In girls lacrosse you cannot use your body to push, so your feet do the work!",
        "points": [
          "Stay low in an athletic stance",
          "Small, quick shuffle steps",
          "Body between your player and the goal"
        ],
        "activity": "Mirror drill: face a partner and shuffle side to side, staying right in front of them for 20 seconds without crossing your feet."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "In women's lacrosse you defend with footwork and angles, not contact. Stay on the attacker's hip in a low base, use drop steps to keep up, and use your feet to channel her one way. Because there is no body checking, your positioning has to be a half-step better than the boys game.",
        "points": [
          "Low base, weight on the balls of your feet",
          "Stay on the attacker's hip, do not get flat",
          "Drop step and shuffle — never cross over",
          "Channel her toward your help or the sideline",
          "Feet first — checking is secondary"
        ],
        "mistakes": "Reaching with the stick and losing the feet, getting flat and beaten to the middle, standing tall, crossing the feet on the recovery."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite women's defenders win with controlled approaches and footwork that takes away a side. Watch how they break down on the approach, stay low, and use angles to force the attacker where the defense wants her — all without fouling. The whole 1v1 is decided by feet and body angle before the stick ever matters.",
        "points": [
          "Controlled approach, break down, low base",
          "Use angles to take away the strong side",
          "Stay on the hip, mirror movement not fakes",
          "Force toward help/sideline, not the cage",
          "Recover with feet to stay legal (no shooting space / 3-second fouls)"
        ],
        "filmCues": "Watch the defender's feet and body angle. She funnels the attacker to a predetermined spot rather than reacting late and reaching."
      }
    },
    "Stick Positioning (3-Second Rule Awareness)": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "You hold your stick out in front to bother the attacker — but in girls lacrosse you cannot stand still in front of the goal too long (the 3-second rule). Keep your stick up and your feet moving!",
        "points": [
          "Stick out front, up in the lane",
          "Do not stand still in the middle too long",
          "Keep moving and stay with your player"
        ],
        "activity": "Practice holding your stick out in front to deflect passes while shuffling. Count \"one-thousand-one\" and remember to keep moving near the goal."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Hold your stick out in front (two hands) to take away passing and shooting lanes — do not windshield-wiper it side to side. Off the ball, stay aware of the 3-second rule: you cannot sit in the 8-meter without closely marking someone. Active stick, legal positioning.",
        "points": [
          "Two-hand stick out front, in the lane",
          "Do not windshield-wiper the stick",
          "Off-ball: mark someone or get out of the 8-meter (3-sec rule)",
          "Stick discipline forces/contains the attacker",
          "Stay between your player and the goal"
        ],
        "mistakes": "Swinging the stick wildly, parking in the 8-meter without marking (3-second foul), dropping the stick out of the lane, reaching across (shooting-space risk)."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite women's defenders use a disciplined held stick to force and contain while staying perfectly legal. Watch how they keep two hands and the stick out front to dictate direction, and how they manage the 3-second count and shooting-space rules off ball so they are always either marking or moving. Stick discipline is the women's-game equivalent of leverage.",
        "points": [
          "Two hands, stick out front to dictate direction",
          "Never windshield-wiper — controlled, in the lane",
          "Manage the 3-second count off ball — mark or move",
          "Avoid shooting-space fouls when sliding/recovering",
          "Stick takes away one option, feet take the rest"
        ],
        "filmCues": "Watch the stick stay out front and quiet, not swinging. Off ball, the defender is always closely marking or clearing the 8-meter — never parked."
      }
    },
    "Interceptions & Anticipation": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "If you read where the ball is going, you can jump the pass and steal it! Watch the passer and be ready to break on the ball.",
        "points": [
          "Watch the ball and your player",
          "Read where the pass is going",
          "Break on the ball to steal it"
        ],
        "activity": "In a 3v3 keep-away, try to read and intercept passes by watching the passer's eyes and stick."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Anticipation turns defense into offense. Position yourself to see both your player and the ball, read the passer, and time a jump into the lane when you are sure. In the no-contact women's game, interceptions and caused turnovers are huge — but only gamble when help is behind you.",
        "points": [
          "See your player AND the ball (open stance)",
          "Read the passer's eyes and stick",
          "Time the jump — do not guess early",
          "Only gamble with help behind you",
          "Turn the steal into a fast break"
        ],
        "mistakes": "Ball-watching and losing your mark, gambling with no help, jumping too early, going for the steal and giving up the easy goal."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite defenders bait passes and anticipate ball movement to create turnovers. Watch how they sag off ball into passing lanes, show one thing to the passer, then break on the skip or the feed. The recovery if they miss is just as important — they only jump when the rotation can cover behind them.",
        "points": [
          "Sag into lanes, bait the pass",
          "Read ball movement, break on the skip/feed",
          "Disguise intent — show one thing, do another",
          "Jump only when rotation covers behind",
          "Convert the caused turnover immediately"
        ],
        "filmCues": "Watch the off-ball defender read the swing before it happens. The interception starts with positioning in the lane, not raw speed."
      }
    },
    "Legal Checking Technique": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "In girls lacrosse you can check the stick, but it has to be safe and away from the head. Use a small, controlled tap downward — never swing near the face!",
        "points": [
          "Only check the stick, never the body or head",
          "Small, controlled downward tap",
          "Check away from the head for safety"
        ],
        "activity": "Practice a light, controlled check on a partner's stick (down and away). Focus on control, not power."
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Legal checks in women's lacrosse are controlled, come from below, and move away from the head (no checks toward the body or face). The best time to check is when the attacker drags her stick or carries it loosely. A timed trail check beats a wild swing — and avoids the foul.",
        "points": [
          "Checks must be controlled and away from the head",
          "Check when the stick is dragged or carried loose",
          "Come from below (low-to-high lift), not down on the head",
          "One timed check, not repeated swinging",
          "Feet/position first, then the legal check"
        ],
        "mistakes": "Checking toward the head or body (dangerous, foul), wild repeated swinging, checking when out of position, reaching across into shooting space."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite women's defenders use checks sparingly and precisely. Watch how they stay on the hip, wait for the attacker to expose the stick, then deliver a clean, controlled trail or lift check well away from the head. The check is a finishing tool on top of great positioning — never a substitute for it.",
        "points": [
          "Position on the hip first, check second",
          "Wait for the stick to be exposed/dragged",
          "Clean trail or lift check, away from the head",
          "Avoid shooting-space and dangerous-check fouls",
          "One decisive legal check, then re-set"
        ],
        "filmCues": "Watch how rarely elite defenders check — and how controlled it is when they do. The turnover is set up by footwork; the legal check just finishes it."
      }
    },
    "Behind-the-Cage Offense": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Behind-the-cage offense means the ball is behind the goal line. From there, you can make good passes to open teammates for easy shots!",
        "points": [
          "Drive the ball to X (behind goal)",
          "Look for cutters in front",
          "Pass to open player for easy finish"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Behind-the-cage is one of the most powerful positions in girls lacrosse. The X player has a wide field of vision and can deliver quick passes to cutters. Timing between the X player and cutters is crucial.",
        "points": [
          "Drive hard to behind-the-goal position",
          "Protect the ball from defense",
          "Read all cutting options",
          "Hit cutters with quick, accurate passes",
          "Know when to look for free position"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite X players score 25%+ of team goals. The behind-the-cage position demands spatial awareness, passing accuracy, and decision-making under pressure. Use ball fakes to open passing lanes.",
        "points": [
          "Footwork to escape initial defender",
          "Multiple pass destinations within 1 second",
          "Free position awareness (8-meter threat)",
          "Reversing the ball across the cage",
          "Timing with off-ball movement"
        ]
      }
    },
    "Free Position Shots (8-Meter)": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "In girls lacrosse, if a player is fouled near the goal, she gets a free shot! It's like a basketball free throw but with a lacrosse stick.",
        "points": [
          "You get fouled near the goal",
          "No one can defend you right away",
          "Take your time and shoot",
          "Practice makes perfect!"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Free position shots are automatic scoring opportunities. Accuracy is everything. Practice consistency from the 8-meter arc.",
        "points": [
          "Plant your feet at the 8-meter line",
          "Cradle to position the stick",
          "Focus on the back of the net",
          "Follow through toward the goal",
          "Placement over power"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite free position shooters hit 80%+. Vary shot angles and placement to keep goalies honest. Use release variations. Factor in goalie positioning and angle tendencies.",
        "points": [
          "Placement accuracy (top shelf, far side) > speed",
          "Read goalie pre-shot positioning",
          "Multiple release options within 1 second",
          "Angle selection based on distance",
          "Psychological confidence (pressure situations)"
        ]
      }
    },
    "Fast Breaks": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A fast break is when your team has more players than the defense, so you run fast and score! Quick passes help you get to the goal.",
        "points": [
          "Get the ball and run downfield fast",
          "More attackers than defenders",
          "Pass to teammates who are open",
          "Shoot and score!"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Girls fast breaks are high-tempo. Numbers advantage (3v2, 4v3) should result in goals. Use spacing and ball movement.",
        "points": [
          "Spread the field (not bunched)",
          "High player (closest to goal) ready to shoot",
          "Wings on the perimeter",
          "Minimal ball touches before shot",
          "One-pass shots in 3v2"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Women's fast breaks emphasize spacing and shot selection. In 3v2, get a shot in one pass. In 4v3, two passes max. No dribbling unless necessary.",
        "points": [
          "Fill lanes immediately off transition",
          "High player angles toward goal for scoring",
          "No low-percentage perimeter shots",
          "Reset if defense sets (transition to set play)",
          "Outlet pass quality from clearing team"
        ]
      }
    },
    "Draw Technique": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "In girls lacrosse, instead of face-offs, two players try to control the ball at center. It's called a draw! The player who controls it gives her team the ball.",
        "points": [
          "Two players stand at center",
          "Ball is between the sticks",
          "Try to control it to your side",
          "Fastest player wins"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The draw is the start of possession. Good draw technique gives your team the ball. Footwork, hand positioning, and scooping speed matter.",
        "points": [
          "Balanced stance before whistle",
          "Quick draw motion (low to high)",
          "Protect the stick and ground ball",
          "Wings positioned for support",
          "Outlet pass to nearest teammate"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite draws set team possession rhythm. Control the draw and your team scores more. Explosive first step off the whistle and precise technique.",
        "points": [
          "Plant and explode mechanics (lower body power)",
          "Stick angle optimization",
          "Wing positioning for numbers advantage",
          "Set plays off draw control (fast break vs reset)",
          "Draw match-up tendencies and personnel"
        ]
      }
    },
    "Speed Dodge (no contact environment)": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A speed dodge is when you blow by your defender using your speed. No fake — just acceleration. You change pace or change direction sharply, then explode past.",
        "points": [
          "Run at the defender with confidence",
          "Plant hard and accelerate the other way",
          "Stick stays protected",
          "Speed past — don't slow down"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The speed dodge in women's lacrosse is the most efficient dodge — no contact rules mean you don't have to worry about getting bumped off line. Sell first step one direction, plant, and accelerate sharply the other. The dodge is in the change of pace, not in a stick fake.",
        "points": [
          "Establish a quick first step in one direction",
          "Plant the outside foot, change direction sharply",
          "Accelerate past the defender with explosive speed",
          "Stick stays protected — defender will reach",
          "Best for athletic players at any position"
        ],
        "mistakes": "Telegraphing the change of direction, slowing down at the dodge point, exposing the stick to a check."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite women's dodgers (Izzy Scane, Charlotte North, Chloe Humphrey) win with speed dodges because no-contact rules let them play through any reach. The advanced version chains a speed dodge with a finish — drive to the cage, draw the help, and either shoot or feed. Used at the top of the 8m and from behind the cage.",
        "points": [
          "Used to attack the 8m for free position or shot",
          "Chain with finish or feed — don't over-dribble",
          "Read help defender — if they slide, kick out to shooter",
          "Most effective when defender is over-pursuing",
          "Combine with rocker dodge or roll for counters"
        ]
      }
    },
    "Cutting to Space": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Cutting to space is when you run to an empty area on the field so your teammate can pass to you. Don't run where defenders are — find the open spot and go!",
        "points": [
          "Find an empty area near the goal",
          "Run hard, don't jog",
          "Show your stick where you want the ball",
          "Time the cut with your teammate's pass"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Cutting to space requires reading both defense and ball. Don't cut into traffic — find the seam between defenders. Time the cut with the passer's release, not with the ball already in flight. The cut should end with your stick up and ready to catch.",
        "points": [
          "Read defensive spacing — find the gap",
          "Cut when the passer's eyes find you",
          "Timing > speed — too early and you clog space",
          "Stick up and out in the catch zone",
          "After catch: attack the goal or feed back"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite cutters in modern women's lacrosse (UNC under Jenny Levy) make cuts that pull the entire defense out of position. The best cuts come BEFORE the ball arrives at the feeder — the defender is already a step behind. Sequence multiple cuts so the defense can't recover. Free movement rules let you cut continuously, no dead spots.",
        "points": [
          "Pre-cut: move BEFORE the feeder gets the ball",
          "Sequence 2-3 cuts to wear out the defender",
          "Use teammates as legal screens to free yourself",
          "Re-cut immediately if the first cut is denied",
          "Cuts that pull defenders open the 8m for shooters"
        ]
      }
    },
    "Slides & Recovery": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "When the ball carrier is about to score, your teammate slides over to help stop them. Then everyone moves down a spot to cover the open player. It's like trading defensive jobs!",
        "points": [
          "Closest defender slides to ball carrier",
          "Next defender slides to the open player",
          "Everyone communicates (\"Slide!\" \"I got ball!\")",
          "Recover quickly to your new player"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Defensive slides only work with communication and timing. The slide must come early enough to stop the dodger but late enough that the offense can't exploit the help. Recovery is just as important — once the ball moves, slide back to your assignment immediately.",
        "points": [
          "Slide on dodge commitment, not anticipation",
          "Communicate slide call loudly (\"Slide!\" \"I'm hot!\")",
          "Adjacent defender rotates to cover open player",
          "Recovery happens on the next pass — don't lock onto the slide",
          "Goalie directs traffic — listen for backside calls"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite women's defenses (UNC, Stony Brook, Boston College) chain slides perfectly because they read offensive intent BEFORE the dodge. The first slide stops the ball, the second slide covers the next-most-dangerous player, and recovery happens with the ball — not after. Modern slides factor in 3-second rule (defender stick out of sphere) and free movement — defenders must adjust quickly to stay legal.",
        "points": [
          "Read offensive set BEFORE the dodge — anticipate slide need",
          "First slide takes the ball, second covers the next-most-dangerous",
          "Recover with the pass — don't lock onto your slide",
          "Stick angle and 3-second rule awareness during slides",
          "Communicate the next help call before they need it (\"two!\" \"second!\")"
        ]
      }
    },
    "Zone Defense Principles": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A backer zone is a defense where most players guard areas, but ONE player (\"the backer\") stays in the middle to help anyone who gets beat. The backer is like a safety net.",
        "points": [
          "Each defender guards an area",
          "The backer stays in the middle to help",
          "Talk loudly so everyone knows where to go",
          "Force shots from outside, protect the goal"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "BTB Girls runs the Backer Zone — Long Island lineage from Jack Kaley to Joe Spallina to modern BTB. Each defender owns an area; the backer floats inside the 8m as permanent help. The backer's job is to protect the most dangerous scoring area and help on dodges.",
        "points": [
          "Each defender owns a zone (mark the cutter in your area)",
          "Backer floats inside 8m as permanent help",
          "Backer takes the most dangerous scoring threat",
          "Force outside shots, protect crease and 8m",
          "Communicate every cut, pick, and pass"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "The backer zone is the most-copied D1 defense (Stony Brook, BC, BTB) because it solves the women's game's biggest threat: the cutter who beats their mark. The backer is a defensive quarterback — she reads the offense, calls coverages, and arrives just in time to stop the dangerous shot. The vulnerability: ball movement around the perimeter forces the backer to choose, and skip passes can find shooters before she can recover.",
        "points": [
          "Backer reads offensive intent before the dodge",
          "Treat backer as rover — chase dangerous threats",
          "Zone defenders must close out shooters fast",
          "Skip passes are the biggest threat — anticipate them",
          "Keep backer fresh — don't over-rotate her on long possessions"
        ]
      }
    },
    "Pick Plays (girls rules on screens)": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A pick is when one player stands still in the way of the defender, blocking them so a teammate can run free. In girls lacrosse, you can't move while picking — you have to be totally still.",
        "points": [
          "Stand totally still when picking",
          "Teammate runs close around you",
          "Defender gets blocked or has to switch",
          "Picker moves to goal after the play"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Girls pick plays must follow strict screen rules: the picker has to be stationary with feet planted before contact. Any movement = illegal pick. The dodger uses the pick by running shoulder-to-shoulder. After the dodge, the picker rolls toward the cage for a feed.",
        "points": [
          "Picker plants feet BEFORE the dodge starts",
          "Dodger runs tight to the picker",
          "Picker rolls to the goal after the dodge",
          "Read defense — switch, hedge, or fight through",
          "Communicate the pick before setting it"
        ],
        "mistakes": "Moving while setting the pick (illegal), dodger running too wide of the pick, picker not rolling."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Modern women's lacrosse uses pick-and-roll as the foundation of their offense (UNC, Northwestern, Syracuse weave). The pick creates a 2v1 advantage — the defense must commit, and the offense reads the commitment. Off-ball picks (where neither player has the ball) are the most dangerous — the defense doesn't see them coming.",
        "points": [
          "Off-ball picks are higher EV than on-ball",
          "Sequence multiple picks to break down the defense",
          "Pick + slip: picker fakes pick and slides to goal",
          "Use picks at the top of the 8m for shooting angle",
          "Read switch vs fight-through to decide attack angle"
        ]
      }
    },
    "Wing Play & Positioning": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "On a draw, two midfielders stand on the wings — left and right of the center circle. When the draw goes up, the wings sprint to get the ball. Whoever wins the wing battle gives their team possession!",
        "points": [
          "Stand on the wing line at the draw",
          "Sprint as soon as the whistle blows",
          "Box out the other player",
          "Get the ball or stop them from getting it"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Wing play is half of draw control. Even if your draw specialist gets the ball into the air, you have to win the wing battle to actually possess. Read the draw's direction (push, pull, clamp) and adjust your angle. Box out aggressively and use your body to create space.",
        "points": [
          "Read the draw direction and adjust angle",
          "Sprint hard at the whistle — first step is everything",
          "Box out using your body, not just your stick",
          "Goalie-side wing scoops backward, attack-side scoops forward",
          "Communicate with your draw specialist pre-game"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite wing play turns 50/50 draws into 70/30 wins. Northwestern (Amonte Hiller) and UNC (Levy) build draw schemes around wing positioning — different setups for push vs pull draws. The defensive wing's job is to be SECOND-quickest to the ball; the offensive wing's job is to be FIRST. Modern teams use stack alignments and pre-determined flight paths to coordinate the entire 5v5 wing scrum.",
        "points": [
          "Stack alignments create predetermined flight paths",
          "Match-up tendencies — know the opposing wing's strength",
          "Defensive wing reads to second ball, offensive to first",
          "Push vs pull draws change wing approach angles",
          "Ground ball recovery within wing scrum is the deciding skill"
        ]
      }
    },
    "Save Technique": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A goalie's job is to stop shots. Drive your top hand at the ball, step toward the shot, and keep your eyes on the ball the whole way. Stay big — make yourself look bigger.",
        "points": [
          "Drive top hand straight at the ball",
          "Step toward the shot with your lead foot",
          "Keep your eyes on the ball",
          "Stay big — make yourself look bigger"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Women's lacrosse goalies face high shots more than men because of the sphere rules and pop shots. Save fundamentals: chest up, top hand to ball, lead foot step. Stance: knees bent, weight on balls of feet, ready to explode. Free position shots are 50% of the saves you'll need to make.",
        "points": [
          "Top hand straight to ball, no sweeping",
          "Lead foot steps toward shot",
          "Free position = pre-set position before whistle",
          "8m save = stay big, make yourself a wall",
          "Recovery: outlet pass within 1 second"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite women's goalies (Taylor Moreno UNC, Madison Doucette BC) hit save percentages above 50%. The key: anticipating shot location based on shooter tendencies. Free position shots: study the shooter's pre-set, where they stick fakes, where they shoot. The \"cut the clock\" technique works for off-stick saves. Communicate the entire defense — you're the quarterback.",
        "points": [
          "Read shooter tendencies pre-shot",
          "Free position: anticipate based on pre-set",
          "Cut the clock on off-stick saves",
          "Quarterback the defense — call slides",
          "Save % above 50% is elite — track yours"
        ]
      }
    },
    "Channeling / Forcing Direction": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Channeling is when you guide the dodger toward where you want them to go. Use your body and your stick to push them away from the goal or toward your help defender.",
        "points": [
          "Position yourself between dodger and goal",
          "Stay low and ready to move",
          "Use small steps — don't cross your feet",
          "Push the dodger toward the sideline or your help"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Channeling is the foundation of 1v1 defense. Force the dodger to her weak hand or away from the goal. Approach with your stick on the inside (between dodger and goal). Feet shoulder-width apart, knees bent, weight balanced. Small lateral steps maintain leverage. Don't cross your feet.",
        "points": [
          "Approach with stick on the inside",
          "Force weak hand or sideline",
          "Small lateral steps, knees bent",
          "Don't cross your feet",
          "Stick out to deny passing lanes"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite defenders (Boston College, Stony Brook) channel by reading the dodger's body language and committing early. The defender who leverages the dodge to her advantage gets the offensive player to a predetermined help spot. Modern women's defense factors in the 3-second rule (stick out of sphere) and free movement — channel WITHOUT illegal contact.",
        "points": [
          "Channel based on dodger's strong hand",
          "Force to predetermined help spot",
          "3-second rule awareness during channeling",
          "Body leverage, not stick checks",
          "Recover if beaten — don't over-pursue"
        ]
      }
    },
    "Drive & Dish": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A drive and dish is when you run hard at the goal, draw the defenders to you, then pass to a teammate who is open. You drive, then dish (give) the ball to a friend.",
        "points": [
          "Drive hard toward the goal",
          "Watch for help defenders coming",
          "Pass to your open teammate",
          "Sometimes shoot if you have a good look"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The drive and dish exploits help defense. Drive at the goal forces the help defender to slide. The moment they commit, you dish to the now-open shooter. Timing is critical — dish too early, the defense recovers; too late, you get checked.",
        "points": [
          "Drive aggressively at the goal",
          "Watch for help defender to commit",
          "Dish at the moment of help commitment",
          "Pass leads the shooter into space",
          "Cutter must catch and shoot in 1 second"
        ],
        "mistakes": "Driving without head up (can't see open teammate), passing too early, taking a low-percentage shot when the dish is open."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Drive and dish is the cornerstone of UNC's women's offense — Chloe Humphrey drove 90+ times last year and either scored or assisted on most of them. Advanced version reads multiple help defenders: drive, watch the first slide, dish to the OPEN shooter (not always the closest). Pre-determined dish patterns (hammer, opposite top) help the timing.",
        "points": [
          "Read multiple help defenders, not just the first",
          "Pre-determined dish patterns speed up the timing",
          "Dish to the most open shooter, not nearest",
          "Combine with picks to create the drive lane",
          "UNC under Levy uses this as a primary action"
        ]
      }
    },
    "Overhand Shot": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "An overhand shot is when you shoot the ball from up high — over your shoulder. It's the most accurate shot. Pull the stick back, step toward the goal, and snap the wrist.",
        "points": [
          "Stick up over your shoulder",
          "Step toward the goal",
          "Snap your wrists",
          "Eyes on where you want the ball to go"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The overhand is your foundation shot. Hands up and away from the body, step into the shot, rotate your hips, pull with the bottom hand across to the opposite hip while the top hand snaps. Placement > velocity. Aim for corners — top shelf or low side.",
        "points": [
          "Hands up and away from body",
          "Step into the shot, rotate hips",
          "Bottom hand pulls across to opposite hip",
          "Top hand snaps for direction",
          "Placement: corners > center"
        ],
        "mistakes": "Dropping the stick before release (loss of power), pushing the ball instead of snapping, aiming at the goalie's body."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite shooters (Charlotte North, Kayla Treanor, Izzy Scane) hit overhand shots above 50%. Vary release point and tempo to keep goalies off-balance. Use shot fakes to commit the goalie, then place the actual shot in the OPPOSITE corner. Highest-velocity shot type — generates the most power for outside shooting.",
        "points": [
          "Vary release point — shoulder, ear, off-temple",
          "Shot fakes commit goalies — shoot opposite of fake",
          "Highest velocity of all shot types",
          "Best for outside shots and free positions",
          "Combine with hesitation step for timing variety"
        ]
      }
    },
    "Set Plays Off the Draw": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "When your team wins the draw (the start of play in girls' lacrosse), good teams have a set play to score quickly! You and your teammates know exactly where to run as soon as you have the ball.",
        "points": [
          "Win the draw and immediately attack",
          "Everyone has a job — pre-determined",
          "Score within 8 seconds if you can",
          "Practice makes the play feel automatic"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Set plays off the draw exploit unsettled defense. Your team has 5-8 seconds before the defense organizes. Common sets: (1) wing rip — wing wins draw and rips down the alley; (2) center attack — draw specialist directs ball to center who attacks; (3) high pop — draw to high cutter for a midfield shot.",
        "points": [
          "Defense is unsettled for 5-8 seconds",
          "Wing rip: ball goes to wing, attack down alley",
          "Center attack: draw specialist drives",
          "High pop: pop to a midfield shooter",
          "Practice the play 100x so it's muscle memory"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Northwestern (Amonte Hiller) and UNC (Levy) score 3-5 goals per game off draws. The set play depends on what the draw specialist directs. Modern teams have 4-6 set plays per draw scheme. Read defense pre-draw — if they sub, run the play that exploits a defensive position with a sub. The 8-second window is the highest-value scoring opportunity in women's lacrosse.",
        "points": [
          "Multiple set plays per draw scheme (4-6+)",
          "Read defensive pre-draw alignment",
          "Score 3-5 goals/game off draws (elite target)",
          "Sub schemes change which play to run",
          "8-second window = highest-value scoring chance"
        ]
      }
    },
    "Free Position Save Technique": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A free position is when a player is fouled near the goal. They get a free shot from the 8-meter line. As goalie, your job is to make yourself BIG and stop the shot.",
        "points": [
          "Make yourself look BIG",
          "Stay set in your stance",
          "Eyes on the ball",
          "Move only when she shoots"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Free position saves are 50% of women's goalie work. Pre-set position: knees bent, stick out, eyes locked. Read the shooter's pre-set — where her stick points often shows where she'll shoot. Don't commit too early. Stay big — make yourself a wall. After save, outlet pass within 1 second.",
        "points": [
          "Pre-set: knees bent, stick out, eyes locked",
          "Read shooter's pre-set position",
          "Don't commit until release",
          "Stay BIG — make yourself a wall",
          "Outlet pass within 1 second of save"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite women's goalies hit 50%+ on free position. Study shooter tendencies on film. Most shooters are taught to fake high and shoot low — don't bite on the fake. Pre-shot routine reduces anxiety. Track the shooter's eyes — they often look where they'll shoot. Communicate with defenders pre-shot to deny the dish-out.",
        "points": [
          "Study shooter tendencies on film",
          "Fake high → shoot low is most common pattern",
          "Don't bite on shot fakes",
          "Pre-shot routine reduces anxiety",
          "Communicate with defenders to deny dish-outs"
        ]
      }
    },
    "Cradling (women's pocket rules)": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Cradling is moving your wrist back and forth so the ball stays in your stick while you run. It's like rocking the ball. Keep your stick up high and close to your body.",
        "points": [
          "Stick up by your shoulder",
          "Wrist moves back and forth",
          "Ball stays in the pocket",
          "Protect with your other hand"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Cradling is the foundation of every stick skill. Stick at shoulder height, top hand on the throat, bottom hand on the butt-end. Wrist rolls smoothly — too much = ball pops out, too little = ball falls. Women's pocket rules require cradling more than men's game (smaller pocket, less ball control).",
        "points": [
          "Stick at shoulder height",
          "Top hand on throat, bottom on butt-end",
          "Smooth wrist roll",
          "Protect with off-arm when defenders are close",
          "Both-hand cradling for safety, one-hand for speed"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite cradlers (Charlotte North, Kayla Treanor) move at full speed with one-hand and two-hand cradles. The cradle creates a rhythm that times with footwork — sprint cadence and cradle cadence sync up. Switch hands during dodges to keep the stick on the protected side. Tighter cradle = faster transitions to pass or shoot.",
        "points": [
          "Sync cradle rhythm with running cadence",
          "Switch hands during dodges to protect ball",
          "Tighter cradle = faster pass/shot transition",
          "One-hand cradle = max speed sprinting",
          "Game-speed cradling separates good from elite"
        ]
      }
    },
    "Ground Balls": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A ground ball is when the ball is on the ground — and you have to scoop it up. Get LOW, run THROUGH the ball, and scoop with both hands. The team that wins more ground balls usually wins the game!",
        "points": [
          "Get low — bend your knees",
          "Run through the ball, don't stop",
          "Both hands on the stick",
          "Scoop and cradle right away"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Ground balls are 50/50 plays — but with technique they become 70/30 wins. Approach low, both hands on stick, scoop UNDER the ball, and explode through. Don't stop on the scoop — momentum carries you out of trouble. Box out the opponent with your body.",
        "points": [
          "Get low — chest near the ground",
          "Run THROUGH the ball, don't stop",
          "Both hands on stick for control",
          "Box out opponent with your body",
          "Communicate: \"ball!\" / \"release!\""
        ],
        "mistakes": "Stopping on the ball (gives it back), reaching with one hand (drops it), standing too tall (can't reach the ball)."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite players turn ground balls into transition opportunities. After scoop, immediately look for outlet (fast break) or attack space (settled offense). Box-out technique is half the battle — use your body to seal the opponent before scooping. Free movement rules let you continue play immediately.",
        "points": [
          "Scoop and immediately look upfield",
          "Box-out before scoop = 70% win rate",
          "Free movement = continue play after scoop",
          "Defensive third GBs start clears",
          "Offensive third GBs = direct scoring chance"
        ]
      }
    },
    "Sidearm Shot": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A sidearm shot is when you shoot with your stick going SIDEWAYS — not over your shoulder. It's a faster shot but harder to aim. Step into the shot and snap your wrists.",
        "points": [
          "Stick goes sideways, not overhead",
          "Step toward the goal",
          "Snap your wrists for power",
          "Aim for the corners"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The sidearm trades accuracy for power. Stick parallel to the ground at shoulder height. Step into the shot, rotate your hips, snap. Use sidearm for time-and-room shots when you can set your feet, or to get under a defender's stick. Best for outside shots from the alley.",
        "points": [
          "Stick parallel to ground at shoulder height",
          "Step into shot, rotate hips fully",
          "More power, less accuracy than overhand",
          "Time and room shots from the alley",
          "Get under a defender's stick check"
        ],
        "mistakes": "Lowering the stick too far (becomes underhand), aiming at the goalie's body, not following through."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite shooters add sidearm to their shot menu to vary release point and beat goalies. Sidearm is the highest-power shot when you can set feet. Combine with shot fakes — fake overhand, drop to sidearm. The deception of release variety is what makes sidearm shooters dangerous: goalie can't commit early.",
        "points": [
          "Vary release point — overhand to sidearm to underhand",
          "Fake overhand, shoot sidearm to deceive goalie",
          "Best velocity when feet are set",
          "Use from alley/wing shooting positions",
          "Pair with hesitation for timing variety"
        ]
      }
    },
    "Passing Accuracy": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A good pass goes right to your teammate's stick. Step toward where you're passing, snap your wrists, and follow through with your stick pointing at the target.",
        "points": [
          "Step toward your target",
          "Top hand on the throat, bottom on the butt-end",
          "Snap your wrists",
          "Follow through — point your stick at the target"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Accurate passes win games. Top hand 12 inches above bottom hand for power. Step into the pass — non-throwing foot toward target. Snap wrists at release. Lead the receiver into space — don't pass to where they ARE, pass to where they WILL BE. Quick stick passes (no cradling) speed up the offense.",
        "points": [
          "Hand spacing: 12\" between hands",
          "Step toward the target",
          "Snap wrists, follow through",
          "Lead the receiver into space",
          "Quick stick passes when possible"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite passers (Charlotte North, Sam Apuzzo) hit teammates in stride at game speed. Vary release point: overhand for accuracy, sidearm for getting under defenders, behind-the-back for deception. Skip passes (over the defense) break zones. Pass quality determines whether a cutter shoots or has to reset.",
        "points": [
          "Vary release point — overhand, sidearm, BTB",
          "Skip passes break zone defenses",
          "Pass quality = shooter's release time",
          "Lead with proper velocity — too soft = intercepted",
          "Quick stick under pressure = elite skill"
        ]
      }
    },
    "Catching on the Move": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Catching while running is harder than catching standing still. Reach out to meet the ball with soft hands. Pull back as you catch — like you're catching a water balloon!",
        "points": [
          "Reach out to meet the ball",
          "Soft hands — like a water balloon",
          "Pull back as you catch",
          "Eyes on the ball into the pocket"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Catching on the move requires meeting the ball with the stick, then giving with your hands as the ball arrives. Stick on the strong side. Eyes on the ball into the pocket. Cradle immediately after catch to keep ball secured. Don't stop running — game speed catching.",
        "points": [
          "Reach out to meet the ball",
          "Give with your hands as ball arrives",
          "Stick on the strong side",
          "Eyes on the ball into the pocket",
          "Cradle immediately after catch"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite players catch + shoot in 1 second at full speed. Soft hands absorb high-velocity passes. Catch on the run + immediate transition to shot or cradle = scoring chance. Practice weak-side catching too — defenders force passes to your weak hand. Behind-the-back catches and one-handed catches are advanced toolkit.",
        "points": [
          "Catch + shoot in 1 second under pressure",
          "Soft hands absorb high-velocity passes",
          "Weak-side catching = full toolkit",
          "One-handed catches when reaching is required",
          "Practice catch-to-shot transitions until automatic"
        ]
      }
    },
    "Change of Direction Dodge": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A change of direction dodge — also called a \"rocker dodge\" — is when you fake going one way, then quickly go the OTHER way. You rock your weight back and forth to fool the defender.",
        "points": [
          "Rock your weight one way",
          "Quickly change direction",
          "Stick stays protected",
          "Speed past the defender"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The rocker dodge uses weight shift and body language to trick the defender. Sell going one direction with hips and shoulders — the defender commits — then explosively rock back the other way. Most often used near the crease but works anywhere on the field. Quick, sharp change of pace.",
        "points": [
          "Sell first direction with hips and shoulders",
          "Defender commits — then change",
          "Quick weight shift — explosive change",
          "Stick stays on protected side",
          "Best near crease but works field-wide"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite women's dodgers chain rocker steps with other dodges. Rocker into split, rocker into roll, rocker into face dodge — the variation prevents defenders from anticipating. Charlotte North uses rocker steps to manipulate defenders before the actual scoring move. Crease roll variation: rocker step into a roll dodge for a finishing shot.",
        "points": [
          "Chain rocker step with other dodges",
          "Rocker into split, roll, or face dodge",
          "Manipulate defender BEFORE the scoring move",
          "Crease roll variation = high-percentage finish",
          "Use as setup move, not always the finish"
        ]
      }
    },
    "Roll Dodge": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A roll dodge is when you spin past your defender. Plant your foot, turn your back, and roll around to the other side. Stick stays close to your body to protect the ball.",
        "points": [
          "Plant foot toward defender",
          "Turn your back, spin around",
          "Stick close to body",
          "Come out the other side and run!"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "In women's lacrosse, the roll dodge plants the same-side foot toward the defender (foot you want to roll TOWARD). Drive forward, contact the defender, then roll around. Stick switches hands during the roll to stay protected. No-contact rules let you play through any reach.",
        "points": [
          "Plant the same-side foot you're rolling toward",
          "Drive forward to contact",
          "Roll around with body protecting stick",
          "Switch hands during the spin",
          "Come out facing the cage"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Jen Adams (Maryland Hall of Famer) made the roll dodge a cornerstone of women's offense. The advanced read: roll when defender over-pursues, split when they back off. Combine with picks, drives, or feeds. Crease roll variation finishes inside the 8m for a high-percentage shot.",
        "points": [
          "Roll vs split is a read of defender pursuit",
          "Crease roll = inside finish at the 8m",
          "Combine with picks for setup",
          "Stick switch protects through the spin",
          "Jen Adams signature — study her game film"
        ]
      }
    },
    "Face Dodge": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A face dodge is a quick fake — you bring the stick across your face like you're going to shoot, then keep running past the defender on the other side. No hand switch, just a quick stick fake.",
        "points": [
          "Run hard at your defender",
          "Pull the stick across your face quickly",
          "Don't switch hands",
          "Keep running and shoot or pass"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The face dodge sells a shot or fake. Stick crosses tight to the face — high enough that the defender bites on the shot, low enough you don't expose the ball. No hand switch keeps you in shooting position immediately. Works in women's game on aggressive defenders who reach for the check.",
        "points": [
          "Fake must be sharp and short",
          "Stick crosses tight to your face",
          "No hand switch (unlike split dodge)",
          "Read defender — face dodge works on aggressive close-outs",
          "Shoot or pass in 1 second after the dodge"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite women's players use face dodges at the 8m and free position approaches. Sell the shot fake hard — defenders bite on the goal threat — then dodge by. Combine with footwork: face dodge + drive to cage + dish. Charlotte North and Izzy Scane combine face dodges with their shooting actions.",
        "points": [
          "Best at the 8m and free position approaches",
          "Sell the shot fake hard before the dodge",
          "Combine: face dodge + drive + dish",
          "Defender's commitment to the fake = the read",
          "Quick double-fake freezes elite defenders"
        ]
      }
    },
    "Pull Shot Dodge": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A pull shot is when you pull your stick across your body to shoot. The pull shot dodge fakes a shot one way, then \"pulls\" your stick across to shoot the other way — surprising the goalie!",
        "points": [
          "Fake a shot one direction",
          "Pull stick across your body",
          "Shoot the other way",
          "Surprise the goalie!"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The pull shot dodge combines a shot fake with a quick stick movement. Sell the shot — goalie commits — then drag the stick across your body to shoot the opposite corner. Works at close range (inside the 8m) where the goalie has less time to react.",
        "points": [
          "Fake the shot first",
          "Goalie commits to one side",
          "Pull stick across body",
          "Shoot opposite corner",
          "Best inside 8m for shorter goalie reaction time"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite shooters chain pull shots with drives and rocker steps. The drag-step pull shot: jab toward topside, plant inside leg, pivot back-pedal toward \"board side,\" then re-establish momentum and shoot. Penn State All-American Emi Smith uses pull shots for low-angle finishes around the crease.",
        "points": [
          "Drag-step pull: jab topside, pivot back-pedal, shoot",
          "Best for low-angle finishes around crease",
          "Riser variation: pull + lift for top-shelf shots",
          "Combine with rocker step for deception",
          "Read goalie pre-set position to choose corner"
        ]
      }
    },
    "Sword Dodge": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "A sword dodge is like a split dodge with a fancy hand switch. You bring the stick down past your opposite hip — like swinging a sword — and switch hands at the bottom.",
        "points": [
          "Like a split dodge with a low stick switch",
          "Bring stick down past opposite hip",
          "Switch hands at the bottom",
          "Come up on the other side ready to shoot"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The sword dodge is a split dodge variation with a unique hand switch. As you cut, slide the bottom hand UP the stick while top hand drives the stick DOWN to the opposite hip. Switch hands while protecting the stick low, then bring it back up. The low switch keeps stick away from defenders' reach.",
        "points": [
          "Bottom hand slides UP, top hand drives DOWN",
          "Switch hands at the opposite hip",
          "Stick stays low during the switch",
          "Bring stick up on the other side",
          "Best vs reachy defenders"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "The sword dodge is a niche variation used by elite players to keep defenders guessing. The low stick path makes it harder to check than a regular split. Combine with hesitation steps for additional deception. Most useful inside the 8m where the close-quarters work makes the low switch effective.",
        "points": [
          "Low stick path = harder to check",
          "Combine with hesitation steps",
          "Best inside 8m for close-quarters",
          "Use as variation to keep defenders guessing",
          "Niche move — split dodge first, sword second"
        ]
      }
    },
    "On-the-Run Shooting": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Shooting on the run is shooting WHILE you're running, not stopping first. You sprint at the goal, plant your foot, and shoot in one motion. Faster = harder for the goalie to react.",
        "points": [
          "Sprint at the goal",
          "Plant your foot for the shot",
          "Shoot in one motion — don't stop",
          "Aim for the corners"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "On-the-run shooting requires squaring hips and shoulders to the cage while at speed. Plant the inside leg, rotate hips through the shot, and run THROUGH the release. Don't stop or slow down — momentum adds power. Practice catching + shooting in 1 motion to install game-speed shooting.",
        "points": [
          "Square hips to the cage",
          "Plant inside leg for the shot",
          "Run THROUGH the release — momentum adds power",
          "Catch + shoot in one motion",
          "Don't slow down — speed kills goalies"
        ],
        "mistakes": "Slowing down before the shot, not squaring to cage, releasing with weight on back foot."
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Taylor Cummings (3x Tewaaraton) built her game on shooting on the run. Her \"BEEF\" framework: Balance, Eyes, Elbows, Follow-through. Elite players hit on-the-run shots above 50%. Vary release point — overhand at game speed for accuracy, sidearm for power. The catch-to-shot transition under 1 second is the elite separator.",
        "points": [
          "Taylor Cummings BEEF: Balance / Eyes / Elbows / Follow-through",
          "Vary release point — overhand for accuracy",
          "Catch-to-shot under 1 second = elite",
          "Hit corners, not center — placement > power",
          "Practice at game speed to build muscle memory"
        ]
      }
    },
    "Communication & Directing the Defense": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "As goalie, you're the boss of the defense! You see everything from the cage — tell your teammates where to go, when to slide, and where the open players are.",
        "points": [
          "Be the boss — direct your defense",
          "Tell defenders where the ball is",
          "Call out slides and rotations",
          "Loud, clear, confident voice"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "The goalie is the defensive quarterback. You see the whole field. Standard calls: ball location, pick coming, slides, recovery. \"Chico, you're hot!\" \"Slide left!\" \"Pick coming high!\" Don't ask questions — assign jobs. Your voice empowers defenders who can't see the ball.",
        "points": [
          "Goalie = defensive quarterback",
          "Assign jobs, don't ask questions",
          "Call: ball, slide, pick, hot",
          "Use names when possible",
          "Empower defenders with backs to ball"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite goalies (Taylor Moreno, Madison Doucette) read offensive sets BEFORE the dodge and direct adjustments. They know matchup tendencies and call defenders into position. Talk is constant — not just on threats. Modern women's goalies factor in the 3-second rule and free movement when calling slides.",
        "points": [
          "Read offensive sets pre-dodge",
          "Know matchup tendencies and direct accordingly",
          "Talk constantly — not just on threats",
          "3-second rule awareness in slide calls",
          "Champion defenses are quarterbacked, not coordinated"
        ]
      }
    },
    "Spacing & Spreading the Field": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Spacing means everyone stands in their OWN spot — not all bunched together. Spread out so the defense has to cover the whole field. Each player owns a zone.",
        "points": [
          "Don't bunch — own your space",
          "Spread out across the field",
          "Defense has to cover everyone",
          "When ball moves, you move"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Spacing is the foundation of women's offense. Position above the 12m to keep defenders out of the 8m. Behind-the-cage X player stretches the defense vertically. Wings stay wide. As the ball moves, the spacing shifts — but always 5+ yards between players.",
        "points": [
          "Position above 12m to clear the 8m",
          "X player stretches defense vertically",
          "Wings stay wide",
          "5+ yards between teammates",
          "Ball movement = spacing shift"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite teams (UNC, Northwestern) use spacing to create automatic 1v1 advantages. The 2-2-3 triangle and umbrella sets enforce specific spacing. Free play (modern unstructured offense) requires extreme spacing IQ — players read teammates' positions and adjust automatically. Spacing creates the \"shooting space\" required by women's rules.",
        "points": [
          "2-2-3 triangle / umbrella sets enforce spacing",
          "Free play requires automatic spacing reads",
          "Creates \"shooting space\" rule compliance",
          "Forces defense into rotations",
          "UNC/NW elite-level spacing IQ"
        ]
      }
    },
    "Recovery Runs": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "When the other team gets a fast break, you have to SPRINT back to defense. Get back to your goal first, then find a player to mark up.",
        "points": [
          "Sprint back when team loses ball",
          "Get goal-side first",
          "Then find a player to mark",
          "Communicate (\"I got ball!\" \"I got top!\")"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Recovery runs prevent fast break goals. The \"stop the ball\" job is #1 — closest defender takes the ball carrier. The next defenders fill in by responsibility (\"Back!\" or \"Split!\"). In numbers-down situations (4v5, 5v6), maximize numbers — get in the hole and let trailers number up.",
        "points": [
          "Stop the ball is job #1",
          "Next defenders fill: \"Back!\" or \"Split!\"",
          "Get in the hole — don't jump upfield",
          "Let trailers number up",
          "Communicate constantly during recovery"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite women's defenses limit transition goals to 1-2/game. The framework: read possession change, sprint goal-side, communicate the matchup, recover with the pass. Modern teams use \"5 backs\" recovery — all 5 field players sprint back simultaneously. Goalies direct the recovery from the cage. Stat: 80% of women's goals come from transition.",
        "points": [
          "Elite limit: 1-2 transition goals/game",
          "Read possession change immediately",
          "\"5 backs\" recovery sprint",
          "Goalie directs recovery from cage",
          "80% of women's goals are transition — recovery is everything"
        ]
      }
    },
    "Reading Defensive Setups": {
      "dev": {
        "label": "2nd-5th Grade Level",
        "text": "Reading the defense means LOOKING at where the defenders are before you make a play. If they're close to you, pass. If they're far, dodge. Use your eyes!",
        "points": [
          "Look at where defenders are",
          "Close defender = pass",
          "Far defender = dodge",
          "Use your eyes BEFORE the ball"
        ]
      },
      "int": {
        "label": "6th-8th Grade Level",
        "text": "Off-ball players must look AWAY from the ball and recognize how the defense is playing. Identify the slide-er and your outlets BEFORE you dodge. Are they man-to-man or zone? Where is help? Pre-scan creates better decisions and faster execution.",
        "points": [
          "Look away from ball — read defense",
          "Identify slider before dodging",
          "Recognize man vs zone",
          "Pre-scan for outlets",
          "Better reads = faster decisions"
        ]
      },
      "adv": {
        "label": "9th-11th Grade Level",
        "text": "Elite players (Charlotte North, Izzy Scane) make 3-4 defensive reads per possession. Visualize sets you'll face pre-game (film study). Watch defender's hips and stick angle to anticipate slides. Modern free-play offense rewards the highest-IQ players — those who read defenses correctly score 1.5-2x more.",
        "points": [
          "3-4 defensive reads per possession",
          "Pre-game film study on opponent sets",
          "Watch defender hips/stick angle",
          "Free-play rewards high IQ",
          "Reading correctly = 1.5-2x more goals"
        ]
      }
    }
  }
};


// ============= VIDEO LIBRARY =============
// NCAA Division I sources only. Every ID oEmbed-verified. No POWLAX.
// Match rule: exact concept names in `concepts` (see getConceptContent).
const VIDEO_LIBRARY = [
  // ── BOYS DEFENSE / OFFENSE (from BTB Boys Defensive Playbook rebuild, Sept 2026) ──
  { id: "HNXqIFbFhdc", title: "Adjacent Slide — Georgetown vs Villanova", channel: "Lacrosse Film Room", source: "D1 Game Film", category: "boys_defense", subcategory: "Team Defense / Slides", concepts: ["Adjacent Slides", "Communication & Calls"], startTime: 0, notes: "Villanova's Kluh dodges from the top; the adjacent Georgetown defender slides, the 2nd and 3rd slides fill, and the defense recovers clean. 15 seconds." },
  { id: "bXz6dVXlz8g", title: "Adjacent Support & Backside Fill — Maryland vs Syracuse 2025", channel: "First Class Lacrosse", source: "D1 Film Breakdown", category: "boys_defense", subcategory: "Team Defense / Slides", concepts: ["Adjacent Slides", "Backside Rotation"], startTime: 70, notes: "Matt Dunn breaks down Maryland supporting from the adjacent, hedging instead of crease-sliding, and the backside filling behind it." },
  { id: "xA8aErPf7To", title: "Crease Slide & Recovery — Notre Dame vs Maryland", channel: "First Class Lacrosse", source: "D1 Film Breakdown", category: "boys_defense", subcategory: "Team Defense / Slides", concepts: ["Crease Slides", "Slide Recovery", "Backside Rotation"], startTime: 0, notes: "One full telestrated Notre Dame possession: crease defender ball-side, open stance, pass-off to the backside, fire to X, recover inside." },
  { id: "F_xzXygfV94", title: "Slide Triggers & Inside-Out Recovery — Notre Dame 2023", channel: "GLE Lacrosse", source: "D1 Film Breakdown", category: "boys_defense", subcategory: "Team Defense / Slides", concepts: ["Crease Slides", "Slide Recovery"], startTime: 62, notes: "Notre Dame's 2023 title defense clip by clip: topside deny at X, crease slide from the wing, hedge-then-go off a pick, inside-out recovery." },
  { id: "cfvDsyJkplk", title: "Notre Dame Defense Masterclass — 2024 Semifinal vs Denver", channel: "GLE Lacrosse", source: "D1 Film Breakdown", category: "boys_defense", subcategory: "Team Defense / Slides", concepts: ["Adjacent Slides", "Communication & Calls"], startTime: 0, notes: "On-ball hold, near-side help and hedge, adjacent slide and the rotation behind it, all on 2024 NCAA semifinal film." },
  { id: "6doDKTgpzvg", title: "Full-Possession Team Defense — Yale vs Duke, 2018 Championship", channel: "LaxFactor", source: "D1 Film Breakdown", category: "boys_defense", subcategory: "Team Defense / Slides", concepts: ["Slide Recovery", "Communication & Calls"], startTime: 0, notes: "Duke dodges wing-to-middle and both alleys hunting the slide. Yale talks, hedges, slides once, and recovers until the turnover." },
  { id: "ubfMhSOY0ac", title: "5 On A Die — Notre Dame Slide & Recovery Drill", channel: "Notre Dame Lacrosse", source: "D1 Practice", category: "boys_defense", subcategory: "Team Defense / Slides", concepts: ["Communication & Calls", "Slide Recovery"], startTime: 0, notes: "Official ND practice film. Preset 5v5 rotation drill: slide, fill, recover, and declare new roles out loud every rep." },
  { id: "B2iFucKI_gM", title: "Duke Staff on Defensive Communication", channel: "Duke Athletics", source: "D1 Coach Clinic", category: "boys_defense", subcategory: "Team Defense / Slides", concepts: ["Communication & Calls"], startTime: 4560, notes: "Danowski, Caputo, and Matt Danowski on talking and listening: see the man, hear the man, head on a swivel, stance that lets you act on the call." },
  { id: "8Sy9oBd5Wug", title: "Defending the 2-Man Game — Maryland 2023", channel: "Peter Treppa", source: "D1 Game Film", category: "boys_defense", subcategory: "Team Defense / Slides", concepts: ["Defending Picks & 2-Man Games"], startTime: 0, notes: "Maryland game film isolated on the two-man game: on-ball fights through, screener's defender shows and stays switch-ready." },
  { id: "XLJq73KSTcg", title: "Inside Duke's Film Room — Hedge & Switch Rules vs Virginia", channel: "USA Lacrosse", source: "D1 Program Access", category: "boys_defense", subcategory: "Team Defense / Slides", concepts: ["Defending Picks & 2-Man Games"], startTime: 150, notes: "Duke's Chris Gabrielli teaches the hedge on film: hedge toward the ball carrier, don't over-hedge, read the contact instead of predetermining the switch." },
  { id: "j9kSgEEjo4U", title: "Pick Locations — Virginia Scores 5 on Picks vs Michigan", channel: "First Class Lacrosse", source: "D1 Film Breakdown", category: "boys_defense", subcategory: "Team Defense / Slides", concepts: ["Defending Picks & 2-Man Games"], startTime: 0, notes: "Five Virginia goals off picks at X, the wing, and up top. Each location gives the defense a different problem." },
  { id: "SxcfMJWpfqE", title: "X Pick-and-Roll — Duke vs Syracuse", channel: "Lacrosse Film Room", source: "D1 Film Breakdown", category: "boys_defense", subcategory: "Team Defense / Slides", concepts: ["Defending Picks & 2-Man Games"], startTime: 0, notes: "Wolf dodges off a Lawson pick at X, draws the double, completes the pick-and-roll. Shows how X picks pull short-sticks into bad matchups." },
  { id: "6SFp0a2Ycig", title: "Defending the 2-Man Game at X — Marist Staff, IMLCA 2020", channel: "Keegan Wilkinson", source: "D1 Coach Clinic", category: "boys_defense", subcategory: "Team Defense / Slides", concepts: ["Defending Picks & 2-Man Games"], startTime: 0, notes: "Full 49-minute clinic: under/over the pick, re-engaging hands, switch-on-contact rules, crease support, and install drills. Coach viewing." },
  { id: "UGRkkLFv-Vw", title: "Off-Ball Positioning — Cornell DC Jordan Stevens", channel: "Coaching Through Cancellation", source: "D1 Coach Clinic", category: "boys_defense", subcategory: "Man-to-Man Defense", concepts: ["Off-Ball Positioning & Help"], startTime: 0, notes: "Off-ball stance (see man and ball), adjacent vs slider vs slider-support jobs, and reading on-ball quality before committing help." },
  { id: "BbT_o-QKPmo", title: "Trail Position Slide Drill — Cornell Practice", channel: "First Class Lacrosse", source: "D1 Practice", category: "boys_defense", subcategory: "Man-to-Man Defense", concepts: ["Trail Technique", "Off-Ball Positioning & Help"], startTime: 0, notes: "Cornell staff coaching live reps: on-ball starts beaten on purpose so trail position, body angle, and the slide call have to connect." },
  { id: "T_6abjxKKE8", title: "Box-and-1 Rotation — Notre Dame vs Duke 2023", channel: "Peter Treppa", source: "D1 Game Film", category: "boys_defense", subcategory: "Man-Down Defense", concepts: ["Rotation Packages"], startTime: 0, notes: "The 2023 champions kill a Duke EMO. Four perimeter defenders rotate with the ball, fifth locked on the crease. Duke never shoots." },
  { id: "rLDWkJ2dcKM", title: "Diamond Rotation — Syracuse Man-Down", channel: "Peter Livingstone", source: "D1 Game Film", category: "boys_defense", subcategory: "Man-Down Defense", concepts: ["Rotation Packages"], startTime: 0, notes: "Four Syracuse defenders rotate in a diamond while the crease stays covered and inside looks are denied." },
  { id: "kyC0UI2Ru44", title: "Pressure Package — Syracuse Junkyard Dogs vs Duke 2024", channel: "GLE Lacrosse", source: "D1 Film Breakdown", category: "boys_defense", subcategory: "Man-Down Defense", concepts: ["Pressure vs Contain", "Rotation Packages"], startTime: 0, notes: "Dedicated five-man unit holds Duke 0-for-2: loose shape, out to hands on the ball, backside collapse, rotate to knock down passes." },
  { id: "HMz0gTEwax0", title: "Maryland Man-Down vs UNC Extra-Man — All 4 Possessions", channel: "Lacrosse Film Room", source: "D1 Game Film", category: "boys_defense", subcategory: "Man-Down Defense", concepts: ["Pressure vs Contain", "Shot Clock Management"], startTime: 0, notes: "UNC finishes 1-for-4. Maryland's on-ball pressure strings UNC out, sticks in lanes, backside covers the crease." },
  { id: "3qthdgKYvqE", title: "Playing the Grey — Loyola HC Charley Toomey", channel: "Hogan's Lacrosse", source: "D1 Coach Clinic", category: "boys_defense", subcategory: "Man-Down Defense", concepts: ["Rotation Packages", "Pressure vs Contain"], startTime: 0, notes: "2012 national champion coach on man-down grey responsibilities: adjacent defenders split two while the on-ball defender pressures." },
  { id: "pYdDg-Vz5UQ", title: "Maryland 3-3 Zone vs Duke", channel: "Lacrosse Film Room", source: "D1 Game Film", category: "boys_defense", subcategory: "Zone Defense", concepts: ["3-3 Zone", "Zone Principles & Rotations"], startTime: 0, notes: "One clean possession: three-up three-down shell, sticks in lanes, top line bumping over on every pass." },
  { id: "oYd-smuIfIU", title: "Virginia's 2011 Championship Zone", channel: "USL CEP", source: "D1 Coach Clinic", category: "boys_defense", subcategory: "Zone Defense", concepts: ["Zone Principles & Rotations", "3-3 Zone"], startTime: 0, notes: "The zone that won UVA the 2011 title, cut for the US Lacrosse Level 3 clinic: base, wing, top jobs, skip-pass rotations, crease cutters." },
  { id: "y9mXncu1Z0k", title: "Bryant 3-3 Zone vs Syracuse — NCAA Tournament", channel: "Lacrosse Film Room", source: "D1 Game Film", category: "boys_defense", subcategory: "Zone Defense", concepts: ["3-3 Zone"], startTime: 0, notes: "A lower seed shrinks the field with the 3-3 against an elite offense in the NCAA first round." },
  { id: "SxcfMJWpfqE", title: "X Pick-and-Roll — Duke vs Syracuse", channel: "Lacrosse Film Room", source: "D1 Film Breakdown", category: "boys_offense", subcategory: "Settled Offense", concepts: ["Two-Man Game", "Pick Plays"], startTime: 0, notes: "Duke's pick-and-roll from X: dodge off the pick, draw the double, pass back, picker attacks the far side." },
  { id: "g88vyAkaB7g", title: "Quinnipiac Lefty 2-Man Game from the Wing", channel: "Lacrosse Film Room", source: "D1 Game Film", category: "boys_offense", subcategory: "Settled Offense", concepts: ["Two-Man Game", "Pick Plays"], startTime: 0, notes: "Keenan and Cuomo run the wing two-man game in the NCAA play-in: picker angle at GLE, dodger turns the corner, roll and pop reads." },
  { id: "j9kSgEEjo4U", title: "Virginia Scores 5 on Picks vs Michigan", channel: "First Class Lacrosse", source: "D1 Film Breakdown", category: "boys_offense", subcategory: "Settled Offense", concepts: ["Pick Plays", "Two-Man Game"], startTime: 0, notes: "Five goals off picks from X, wing, and top. McCabe Millon scores four. Location changes the read every time." },
  { id: "0D04crVSZYc", title: "Duke 1-3-2 Shallow Cut Midfield Dodging", channel: "Lacrosse Film Room", source: "D1 Film Breakdown", category: "boys_offense", subcategory: "Settled Offense", concepts: ["1-3-2 Formation", "Pick Plays"], startTime: 0, notes: "Adjacent midfielder shallow-cuts under the dodge and pops back to top center. Every option off the cut plus how D1 defenses answered." },
  // ── BOYS: fundamentals, offense, face-offs, goalie (from Boys Coaching Manual rebuild) ──
  { id: "gBvCCLhPQwA", title: "Dave Pietramala on Building Stick Skills", channel: "Lacrosse All Stars", source: "D1 Coach Clinic", category: "boys_fundamentals", subcategory: "Stick Skills", concepts: ["Stick Protection", "Weak Hand Development"], startTime: 0, notes: "Johns Hopkins HC at LaxCon on the daily stick work that builds a D1 player." },
  { id: "CuP02lWG77k", title: "Developing & Perfecting Stick Skills — John Danowski", channel: "Championship Productions", source: "D1 Coach Clinic", category: "boys_fundamentals", subcategory: "Stick Skills", concepts: ["Passing (Overhand, Sidearm)", "Catching (Stationary, On the Move)"], startTime: 0, notes: "Duke HC on stick fundamentals." },
  { id: "cp6WtokQEp0", title: "\"Dynamo\" Passing Drill", channel: "Notre Dame Lacrosse", source: "D1 Practice", category: "boys_fundamentals", subcategory: "Stick Skills", concepts: ["Passing (Overhand, Sidearm)", "Catching (Stationary, On the Move)"], startTime: 0, notes: "Official Notre Dame practice drill for passing under movement." },
  { id: "93G6BCjlrvQ", title: "\"3 Wide\" Scooping, Passing & Shooting", channel: "Notre Dame Lacrosse", source: "D1 Practice", category: "boys_fundamentals", subcategory: "Stick Skills", concepts: ["Ground Balls", "Passing (Overhand, Sidearm)"], startTime: 0, notes: "Notre Dame drill that chains scoop, pass, and shot." },
  { id: "wIOjTHxEJ3A", title: "Ground Ball \"Train\" Drill", channel: "Notre Dame Lacrosse", source: "D1 Practice", category: "boys_fundamentals", subcategory: "Stick Skills", concepts: ["Ground Balls"], startTime: 0, notes: "Notre Dame ground ball drill." },
  { id: "KPuT6OPK61c", title: "Your Edge: Ground Balls with Mike Pellegrino", channel: "US Lacrosse Magazine", source: "D1 Coach Clinic", category: "boys_fundamentals", subcategory: "Stick Skills", concepts: ["Ground Balls"], startTime: 0, notes: "Johns Hopkins on ground ball technique." },
  { id: "IGTV3d2n4Oo", title: "\"Swarm GB\" Drill — Lars Tiffany", channel: "Championship Productions", source: "D1 Coach Clinic", category: "boys_fundamentals", subcategory: "Stick Skills", concepts: ["Ground Balls"], startTime: 0, notes: "Virginia HC's competitive ground ball drill." },
  { id: "apiiYiq6AqY", title: "Face Dodge Stick Protection — Bryce Walker", channel: "Peter Treppa", source: "D1 Game Film", category: "boys_fundamentals", subcategory: "Stick Skills", concepts: ["Stick Protection"], startTime: 0, notes: "Notre Dame game clip: protecting the stick through a face dodge." },
  { id: "PkkxAMF6jMc", title: "Midfielder Moves: Sergio Salcido's Split Dodge", channel: "Lacrosse Film Room", source: "D1 Film Breakdown", category: "boys_offense", subcategory: "Dodging (1v1 Moves)", concepts: ["Split Dodge"], startTime: 0, notes: "Syracuse midfielder's split dodge broken down on game film." },
  { id: "cD4vyMivraw", title: "Right-to-Left Split, Roll Back, Shoot", channel: "Lacrosse Film Room", source: "D1 Film Breakdown", category: "boys_offense", subcategory: "Dodging (1v1 Moves)", concepts: ["Split Dodge", "Roll Dodge"], startTime: 0, notes: "Split dodge into a roll-back counter and shot." },
  { id: "GVrTJClUzjg", title: "How to Inside Roll: Maryland's Eric Spanos", channel: "First Class Lacrosse", source: "D1 Film Breakdown", category: "boys_offense", subcategory: "Dodging (1v1 Moves)", concepts: ["Inside Roll", "Roll Dodge"], startTime: 0, notes: "Maryland attackman's inside roll, step by step." },
  { id: "xyARjX88r8I", title: "Attack Moves: The Inside Roll", channel: "Lacrosse Film Room", source: "D1 Film Breakdown", category: "boys_offense", subcategory: "Dodging (1v1 Moves)", concepts: ["Inside Roll"], startTime: 0, notes: "Inside roll on D1 game film." },
  { id: "vmVfILIHxPo", title: "Film Review: Alley Dodging & Shooting on the Run", channel: "LaxFactor", source: "D1 Film Breakdown", category: "boys_offense", subcategory: "Shooting", concepts: ["On-the-Run Shooting"], startTime: 0, notes: "D1 film review of alley dodges finishing on the run." },
  { id: "YGJL5nDTnMU", title: "\"Pistons\" Dodging & Shooting Drill", channel: "Notre Dame Lacrosse", source: "D1 Practice", category: "boys_offense", subcategory: "Shooting", concepts: ["On-the-Run Shooting", "Time & Room Shooting"], startTime: 0, notes: "Notre Dame's dodging and shooting drill." },
  { id: "TUdJCqSogWQ", title: "Albany's Thompsons Run the 2-Man Game from X", channel: "Lacrosse Film Room", source: "D1 Game Film", category: "boys_offense", subcategory: "Settled Offense", concepts: ["Two-Man Game", "Pick Plays"], startTime: 0, notes: "Miles Thompson scores after a pick from X." },
  { id: "kIY2zLuuHn4", title: "The 2022 Maryland Offense, Broken Down", channel: "First Class Lacrosse", source: "D1 Film Breakdown", category: "boys_offense", subcategory: "Settled Offense", concepts: ["Motion Offense"], startTime: 0, notes: "How the undefeated 2022 Terps generated shots." },
  { id: "XEGBUh350DE", title: "Georgetown Scores on the 1-4-1 \"Mumbo-Pop\"", channel: "Lacrosse Film Room", source: "D1 Film Breakdown", category: "boys_offense", subcategory: "Extra Man Offense (EMO)", concepts: ["1-4-1 EMO Set"], startTime: 0, notes: "Georgetown EMO set breakdown." },
  { id: "QKxaYzfBYWE", title: "Play of the Week: Shovel Pass Goal", channel: "Army West Point Athletics", source: "D1 Game Film", category: "boys_offense", subcategory: "Settled Offense", concepts: ["Motion Offense"], startTime: 0, notes: "Inside shovel-pass assist and finish." },
  { id: "_HHd3k3HCt8", title: "Carry Through X, Lever Pass Inside — Kavanagh to Taylor", channel: "Peter Treppa", source: "D1 Game Film", category: "boys_offense", subcategory: "Settled Offense", concepts: ["Motion Offense"], startTime: 0, notes: "Notre Dame feed from X to the crease." },
  { id: "jkpBIybDkP4", title: "Jesse Bernhardt's Shadow Footwork Drill", channel: "First Class Lacrosse", source: "D1 Practice", category: "boys_defense", subcategory: "Man-to-Man Defense", concepts: ["On-Ball Footwork & Positioning"], startTime: 0, notes: "Maryland footwork drill for on-ball defense." },
  { id: "Qd0QpCs06_M", title: "\"32 Lunch Pail\" Defense Drill", channel: "Notre Dame Lacrosse", source: "D1 Practice", category: "boys_defense", subcategory: "Man-to-Man Defense", concepts: ["On-Ball Footwork & Positioning", "Approach Technique"], startTime: 0, notes: "Notre Dame on-ball defense drill." },
  { id: "Q14sn4Y7S2Y", title: "AJ Larkin's \"T\" Defensive Footwork Drill", channel: "First Class Lacrosse", source: "D1 Practice", category: "boys_defense", subcategory: "Man-to-Man Defense", concepts: ["On-Ball Footwork & Positioning"], startTime: 0, notes: "Maryland defenseman's footwork drill." },
  { id: "FMhBEObe9sE", title: "\"Irish Channel\" Defense Drill", channel: "Notre Dame Lacrosse", source: "D1 Practice", category: "boys_defense", subcategory: "Man-to-Man Defense", concepts: ["Approach Technique", "Body Positioning & Leverage"], startTime: 0, notes: "Notre Dame drill for channeling the dodger." },
  { id: "kH7eLuUw3Gw", title: "\"Umbrella\" Defensive Approach Drill", channel: "Notre Dame Lacrosse", source: "D1 Practice", category: "boys_defense", subcategory: "Man-to-Man Defense", concepts: ["Approach Technique"], startTime: 0, notes: "Notre Dame approach drill." },
  { id: "BgIZTqf6Jhs", title: "Film Review: Cornell's Defense Shuts Down Yale", channel: "LaxFactor", source: "D1 Film Breakdown", category: "boys_defense", subcategory: "Team Defense / Slides", concepts: ["Slide Recovery", "Communication & Calls"], startTime: 120, notes: "Ivy League film review of Cornell's team defense." },
  { id: "STH09MBoa8g", title: "Face-Off Film Room: Trevor Baptiste vs TD Ierlan", channel: "Lacrosse Film Room", source: "D1 Film Breakdown", category: "boys_faceoffs", subcategory: "Face-Off Technique", concepts: ["Clamp Technique"], startTime: 0, notes: "Two of the best face-off men in D1 history, broken down." },
  { id: "MutQyQvmu-4", title: "Face-Off Film Room: Trevor Baptiste vs Notre Dame", channel: "Lacrosse Film Room", source: "D1 Film Breakdown", category: "boys_faceoffs", subcategory: "Face-Off Technique", concepts: ["Clamp Technique"], startTime: 0, notes: "Baptiste's clamp and exits against Notre Dame." },
  { id: "N4yYOSv6y8c", title: "Face-Off Film Room: Baptiste vs Withers", channel: "Lacrosse Film Room", source: "D1 Film Breakdown", category: "boys_faceoffs", subcategory: "Face-Off Technique", concepts: ["Clamp Technique"], startTime: 0, notes: "Counters and reads between two D1 face-off men." },
  { id: "iDuoh7TVHq8", title: "Top Face-Off Counters, 2024 NCAA Season", channel: "Faceoff Zone", source: "D1 Game Film", category: "boys_faceoffs", subcategory: "Face-Off Technique", concepts: ["Clamp Technique"], startTime: 0, notes: "The best counter moves from the 2024 D1 season." },
  { id: "DRD-ZtO-lGM", title: "Face-Off & Ground Ball Drills — Matt Francis", channel: "Coaching Through Cancellation", source: "D1 Coach Clinic", category: "boys_faceoffs", subcategory: "Face-Off Technique", concepts: ["Clamp Technique", "Wing Play & Ground Ball Situations"], startTime: 0, notes: "Providence face-off coach's drill progression." },
  { id: "OgtCk58xsao", title: "Developing Wing Play — Matt Francis", channel: "Coaching Through Cancellation", source: "D1 Coach Clinic", category: "boys_faceoffs", subcategory: "Face-Off Technique", concepts: ["Wing Play & Ground Ball Situations"], startTime: 0, notes: "Providence staff on wing responsibilities after the whistle." },
  { id: "gdqmuSqYhhc", title: "LoCascio Face-Off Ground Ball Leads to Rice Goal", channel: "Lacrosse Film Room", source: "D1 Game Film", category: "boys_faceoffs", subcategory: "Face-Off Technique", concepts: ["Wing Play & Ground Ball Situations"], startTime: 0, notes: "Face-off ground ball to fast-break goal." },
  { id: "WXb4yyGhteY", title: "Face-Off Training Drills", channel: "Notre Dame Lacrosse", source: "D1 Practice", category: "boys_faceoffs", subcategory: "Face-Off Technique", concepts: ["Clamp Technique"], startTime: 0, notes: "Notre Dame face-off unit training." },
  { id: "iXA6PtfVnws", title: "John Galloway's Goalie Warm-Up Drills", channel: "Championship Productions", source: "D1 Coach Clinic", category: "boys_goalie", subcategory: "Goalie Skills", concepts: ["Positioning & Arc Play"], startTime: 0, notes: "Jacksonville HC and former Syracuse All-American goalie's warm-up." },
  { id: "QkqYyDH5Yog", title: "5 Minutes of Maryland Goalies Warming Up", channel: "Lax Goalie Rat", source: "D1 Game Film", category: "boys_goalie", subcategory: "Goalie Skills", concepts: ["Positioning & Arc Play"], startTime: 0, notes: "Maryland goalie pregame warm-up." },
  { id: "1MGRqrWgpSY", title: "Notre Dame Goalies: Hand-Eye Drills", channel: "Notre Dame Lacrosse", source: "D1 Practice", category: "boys_goalie", subcategory: "Goalie Skills", concepts: ["Shot Recognition & Anticipation"], startTime: 0, notes: "Notre Dame goalie hand-eye work." },
  { id: "HznTfjYHSvA", title: "5-Hole Save Technique — Brian Ruppel", channel: "Lax Goalie Rat", source: "D1 Coach Clinic", category: "boys_goalie", subcategory: "Goalie Skills", concepts: ["Save Technique (High, Low, Stick Side, Off-Stick)"], startTime: 0, notes: "Maryland goalie on the five-hole save." },
  { id: "7v79Wb-TWT4", title: "Kyle Bernlohr Makes 14 Saves vs Syracuse", channel: "Lacrosse Film Room", source: "D1 Game Film", category: "boys_goalie", subcategory: "Goalie Skills", concepts: ["Save Technique (High, Low, Stick Side, Off-Stick)", "Positioning & Arc Play"], startTime: 0, notes: "Every save from a 14-save D1 game." },
  // ── GAP FILL (ride, clear, transition, zone, wall ball; girls ride/transition/set plays/cradling) ──
  { id: "xwLGD4mqIQs", title: "UNC 10-Man Ride vs Lafayette", channel: "Lacrosse Film Room", source: "D1 Game Film", category: "boys_defense", subcategory: "Riding (Preventing Clears)", concepts: ["10-Man Ride", "Press Ride"], startTime: 0, notes: "UNC goes to the 10-man several times: multiple caused turnovers, one broken ride. Both outcomes teach." },
  { id: "8OO-4iBXPAk", title: "Notre Dame's Aggressive Rides vs Detroit", channel: "Lacrosse Film Room", source: "D1 Game Film", category: "boys_defense", subcategory: "Riding (Preventing Clears)", concepts: ["Press Ride", "10-Man Ride"], startTime: 0, notes: "Down five late, Notre Dame escalates from a press ride to a full 10-man in the 2013 NCAA first round." },
  { id: "fk9jVzSqh30", title: "Coaches Clinic: The 10-Man Ride — Ken Broschart", channel: "MGoBlueLacrosse", source: "D1 Coach Clinic", category: "boys_defense", subcategory: "Riding (Preventing Clears)", concepts: ["10-Man Ride", "Press Ride", "Zone Ride"], startTime: 60, notes: "Michigan assistant installs the 10-man: pulling the goalie to midfield, the 100/90/80 variants, attack slides, when to run it." },
  { id: "KpPgzEGNNGE", title: "X's and O's: The Clearing Game — Joe Alberici", channel: "Army West Point Athletics", source: "D1 Coach Clinic", category: "boys_offense", subcategory: "Clearing", concepts: ["Settled Clears"], startTime: 0, notes: "Army head coach on the settled clearing game, whiteboard plus Army game film." },
  { id: "3zti4QXiLxc", title: "Coaches Clinic: The Clearing Factor", channel: "MGoBlueLacrosse", source: "D1 Coach Clinic", category: "boys_offense", subcategory: "Clearing", concepts: ["Settled Clears", "Press Break Clears"], startTime: 0, notes: "Michigan staff on clearing structure and attacking pressure rides. Long-form coach viewing." },
  { id: "TQoUasAqZNU", title: "Virginia V Fast Breaks", channel: "Lacrosse Film Room", source: "D1 Film Breakdown", category: "boys_offense", subcategory: "Transition Offense", concepts: ["Fast Breaks (4v3, 3v2)"], startTime: 0, notes: "Virginia's V-shaped 4v3: point draws the top defender, wings space, skip or adjacent read." },
  { id: "D7x5sRjN4to", title: "Syracuse Fast Break off a Duke Substitution Mistake", channel: "Lacrosse Film Room", source: "D1 Film Breakdown", category: "boys_offense", subcategory: "Transition Offense", concepts: ["Fast Breaks (4v3, 3v2)", "Unsettled Situations"], startTime: 0, notes: "How a numbers advantage is created at the sub box and finished in transition." },
  { id: "ndaAAqoJXqM", title: "Virginia's Pressure Zone — 2022", channel: "Peter Treppa", source: "D1 Game Film", category: "boys_defense", subcategory: "Zone Defense", concepts: ["Zone Principles & Rotations", "3-3 Zone"], startTime: 0, notes: "Compilation of Virginia's 2022 zone under Tiffany: the shell extends to the ball and doubles on the wings." },
  { id: "fLQhNF0nHaU", title: "My Wall Ball Routine — Joey Sankey", channel: "Sankey Lacrosse", source: "D1 Player Session", category: "boys_fundamentals", subcategory: "Stick Skills", concepts: ["Weak Hand Development", "Stick Protection"], startTime: 0, notes: "UNC All-American walks through his routine rep by rep." },
  { id: "XguuoPHwLR8", title: "How Ohio State Trains Their Ride — Amy Bokker", channel: "Championship Productions", source: "D1 Coach Clinic", category: "girls_defense", subcategory: "Defensive Transition", concepts: ["Preventing Fast Breaks", "Numbers Back Principles"], startTime: 0, notes: "Ohio State HC builds the ride in parts before putting the full team ride together." },
  { id: "7s8TpFDc5Qs", title: "Attacking a Zone from a Set: Duke & Eva Pronti", channel: "First Class Lacrosse", source: "D1 Film Breakdown", category: "girls_offense", subcategory: "Settled Offense", concepts: ["Reading Defensive Setups", "Spacing & Spreading the Field"], startTime: 0, notes: "Duke runs the same structured look repeatedly; four assists off one action." },
  { id: "VUaWghgMZm4", title: "How to Cradle — Taylor Cummings LAX 101", channel: "Taylor Cummings", source: "D1 Player Session", category: "girls_fundamentals", subcategory: "Stick Skills", concepts: ["Cradling (women's pocket rules)"], startTime: 0, notes: "Three-time Tewaaraton winner teaches cradling fundamentals with a women's stick." },
  { id: "HSNR9_pCVEU", title: "Fundamentals of Cradling & Dodging — Ally Carey", channel: "USA Lacrosse", source: "D1 Player Session", category: "girls_fundamentals", subcategory: "Stick Skills", concepts: ["Cradling (women's pocket rules)"], startTime: 0, notes: "Vanderbilt alum and U.S. National Team player on cradling that flows into the dodge." },
  { id: "yPznrvq_JiY", title: "Cathy Reese at LaxCon: Transition", channel: "USA Lacrosse", source: "D1 Coach Clinic", category: "girls_offense", subcategory: "Transition Offense", concepts: ["Fast Breaks"], startTime: 0, notes: "Maryland head coach on how the Terps attack numbers-up transition." },
  { id: "5QtJX_FTen0", title: "Transition Training — Hannah Nielsen", channel: "WOMENSLAXDRILLS", source: "D1 Coach Clinic", category: "girls_offense", subcategory: "Transition Offense", concepts: ["Fast Breaks"], startTime: 0, notes: "Michigan head coach and four-time Northwestern champion on fast and slow break spacing and trail options." },
  { id: "3BiM6WVgyC8", title: "BC Fast Break vs Syracuse", channel: "To Illustrate", source: "D1 Game Film", category: "girls_offense", subcategory: "Transition Offense", concepts: ["Fast Breaks"], startTime: 0, notes: "Live women's D1 numbers-up break, Boston College against Syracuse." },
  // ── GIRLS: defense, goalie, draws, offense, fundamentals (from Girls Playbook + Manual rebuild) ──
  { id: "gzZfd3jwPzE", title: "Adjacent Slides with Cookie Carr", channel: "USA Lacrosse", source: "D1 Coach Clinic", category: "girls_defense", subcategory: "Team Defense", concepts: ["Slides & Recovery", "Communication Calls"], startTime: 0, notes: "Johns Hopkins assistant Cookie Carr: keep your girl and the ball in sight, slide to where the carrier is going, be decisive." },
  { id: "RZWTcRZTlk0", title: "Slide, Double, Recover — Ann Elliott", channel: "Championship Productions", source: "D1 Coach Clinic", category: "girls_defense", subcategory: "Team Defense", concepts: ["Slides & Recovery", "Double Teams"], startTime: 0, notes: "Former Northwestern associate HC runs the 2v2 with outlet: slide toward the stick, lock the double, beaten defender recovers." },
  { id: "ye9Csy2koPo", title: "Teaching the Slide — Colleen Magarity", channel: "JM3 Sports", source: "D1 Coach Clinic", category: "girls_defense", subcategory: "Team Defense", concepts: ["Slides & Recovery"], startTime: 1513, notes: "Three-time Northwestern champion teaches the Wildcats slide system with film. Recovery rule at 1:21:20: the player who started on ball recovers." },
  { id: "rs_IlqTv-VM", title: "Defensive Concepts for the Women's Game — Scott Teeter", channel: "Lacrosse-TV", source: "D1 Coach Clinic", category: "girls_defense", subcategory: "Team Defense", concepts: ["Slides & Recovery", "Communication Calls"], startTime: 1760, notes: "Louisville HC: help comes inside-out from the hub so the slider stays in the passing lane and out of shooting space." },
  { id: "-xcUVMYN_Z0", title: "\"Take Charge\" Help Defense — Amy Bokker", channel: "Championship Productions", source: "D1 Coach Clinic", category: "girls_defense", subcategory: "Team Defense", concepts: ["Slides & Recovery", "Man-to-Man Marking"], startTime: 0, notes: "Stanford 4v4 built on the help package behind the ball: hedge in, cross-crease slide, recover." },
  { id: "DdbhzZfkKtE", title: "Double Team Drill — Northwestern Practice", channel: "Championship Productions", source: "D1 Practice", category: "girls_defense", subcategory: "Team Defense", concepts: ["Double Teams"], startTime: 0, notes: "Kelly Amonte Hiller's double team drill: on-ball forces a side, second defender arrives and locks the double." },
  { id: "Swi4bfjT9PM", title: "Midfield Double-Team Drill — Amy Bokker", channel: "Championship Productions", source: "D1 Coach Clinic", category: "girls_defense", subcategory: "Team Defense", concepts: ["Double Teams"], startTime: 0, notes: "Two defenders trap the ball carrier in the midfield and turn her; the carrier works to escape. Both sides of the double." },
  { id: "evN-yDJ5AxM", title: "Women's Zone Breakdown: Denver's Sam Thacker", channel: "First Class Lacrosse", source: "D1 Film Breakdown", category: "girls_defense", subcategory: "Team Defense", concepts: ["Zone Defense Principles"], startTime: 26, notes: "2023 NCAA quarterfinal. The rover flows ball-side inside the 8, reads the weak-side 2v1 and sprints across the eight." },
  { id: "OTZDYafhtKY", title: "Albany Backer Zone vs Stony Brook", channel: "Lacrosse Film Room", source: "D1 Game Film", category: "girls_defense", subcategory: "Team Defense", concepts: ["Zone Defense Principles"], startTime: 99, notes: "Thirteen minutes of uncut 2016 America East championship film with the backer identified on every possession." },
  { id: "nuZne9SMmkI", title: "Florida Extra Attacker vs Syracuse", channel: "Lacrosse Film Room", source: "D1 Game Film", category: "girls_defense", subcategory: "Team Defense", concepts: ["Zone Defense Principles"], startTime: 0, notes: "Three real yellow-card possessions. Watch where the short-handed zone loses the adjacent skip and the inside feed." },
  { id: "iSiacH_Dm78", title: "Maryland Woman-Down vs UNC — 2026 Semifinal", channel: "NCAA Championships", source: "D1 Game Film", category: "girls_defense", subcategory: "Team Defense", concepts: ["Zone Defense Principles", "Communication Calls"], startTime: 1525, notes: "Maryland drops from man-to-man into a woman-down zone after a yellow card. Broadcast explains why." },
  { id: "Gbcjc1D65DA", title: "Open Practice: Breaking Down Defense — Cindy Timchal", channel: "Championship Productions", source: "D1 Practice", category: "girls_defense", subcategory: "Team Defense", concepts: ["Communication Calls", "Man-to-Man Marking"], startTime: 0, notes: "Navy staff runs the defensive unit live: pressure the ball, talk, do not give up lanes." },
  { id: "xagDjIf_8UA", title: "Janine Tucker: Do's and Don'ts of On-Ball Defense", channel: "Championship Productions", source: "D1 Coach Clinic", category: "girls_defense", subcategory: "Individual Defense", concepts: ["Positioning & Footwork", "Channeling / Forcing Direction"], startTime: 0, notes: "Johns Hopkins HC: low player wins, feet moving, hands and arm position, angle to contain." },
  { id: "ko6QbOcpbmw", title: "Train Like a College Defender — Duke & BC", channel: "First Class Lacrosse", source: "D1 Practice", category: "girls_defense", subcategory: "Individual Defense", concepts: ["Positioning & Footwork", "Channeling / Forcing Direction"], startTime: 0, notes: "Madison Beale (Duke) and Shea Baker (BC): C-approach, break the feet down, read hips, flip hips downhill." },
  { id: "T-hMVK3U1eQ", title: "Defensive Box Drill — Meg Douty", channel: "Athletes Unlimited", source: "D1 Player Session", category: "girls_defense", subcategory: "Individual Defense", concepts: ["Positioning & Footwork"], startTime: 0, notes: "Two-time Maryland champion: approach on a C, break down with toes on a line pointed at the attacker, controlled shuffles." },
  { id: "R7URthwoIfo", title: "Maryland Women's Lacrosse All-Access: Defense", channel: "MarylandAthletics", source: "D1 Game Film", category: "girls_defense", subcategory: "Individual Defense", concepts: ["Man-to-Man Marking", "Positioning & Footwork"], startTime: 0, notes: "Official Maryland Athletics feature on the disciplined 1v1 on-ball system behind seven IWLCA Defenders of the Year." },
  { id: "T7bqKxUKdUE", title: "Checking & Footwork Drill — Caitlin Defliese", channel: "STX Women's Lacrosse", source: "D1 Coach Clinic", category: "girls_defense", subcategory: "Individual Defense", concepts: ["Legal Checking Technique"], startTime: 0, notes: "Syracuse assistant runs a partner drill for timing the check off the defender's feet." },
  { id: "DaxF-sT_XZ0", title: "Saves Against a Crease Attacker — Madison Doucette", channel: "Lax Goalie Rat", source: "D1 Player Session", category: "girls_goalie", subcategory: "Goalie Skills", concepts: ["Positioning & Arc Play", "Save Technique"], startTime: 0, notes: "Northwestern goalie: hold ground on the pipe against the crease roll instead of creeping out." },
  { id: "1lwhUhEnfd4", title: "Save Breakdown — Madison Doucette", channel: "Lax Goalie Rat", source: "D1 Player Session", category: "girls_goalie", subcategory: "Goalie Skills", concepts: ["Positioning & Arc Play"], startTime: 0, notes: "Doucette walks through her own Northwestern game saves and where she was on the arc for each shot origin." },
  { id: "K0Dwq3aTzkI", title: "Stepping Drill for Goalkeeping — Phil Barnes", channel: "Championship Productions", source: "D1 Coach Clinic", category: "girls_goalie", subcategory: "Goalie Skills", concepts: ["Positioning & Arc Play", "Save Technique"], startTime: 0, notes: "UNC goalie coach's stepping drill: set on the arc point and drive the correct step to each shot location." },
  { id: "bkMMt8mylak", title: "Butt End Training with Megan Taylor", channel: "USA Lacrosse", source: "D1 Player Session", category: "girls_goalie", subcategory: "Goalie Skills", concepts: ["Save Technique"], startTime: 0, notes: "Maryland's Tewaaraton goalie defines the women's ready position: balls of the feet, thumb at eye level, watch it all the way in." },
  { id: "w9nPFOJquvA", title: "Megan Taylor vs Taylor Moreno — Maryland vs UNC Saves", channel: "Women's Lacrosse Save Edits", source: "D1 Game Film", category: "girls_goalie", subcategory: "Goalie Skills", concepts: ["Save Technique"], startTime: 0, notes: "Every save by two Tewaaraton-level goalies in one D1 game. Freeze on the pre-shot set position." },
  { id: "RmsE3Pdb2A4", title: "2024 Championship: Goalie 1v1 Reads", channel: "NCAA Championships", source: "D1 Game Film", category: "girls_goalie", subcategory: "Goalie Skills", concepts: ["Save Technique", "Free Position Save Technique"], startTime: 370, notes: "Northwestern vs BC national title game. Laliberty holds her line on an isolated left-hand drive." },
  { id: "fSnaykPtX7s", title: "2024 Championship Save Edit — Dolce vs Laliberty", channel: "Lax Goalie Rat", source: "D1 Game Film", category: "girls_goalie", subcategory: "Goalie Skills", concepts: ["Save Technique", "Free Position Save Technique"], startTime: 0, notes: "Every save from the 2024 title game, goalie-first with replays." },
  { id: "QQWzqitkXfA", title: "All 17 of Delaney Sweitzer's Championship Saves", channel: "First Class Lacrosse", source: "D1 Game Film", category: "girls_goalie", subcategory: "Goalie Skills", concepts: ["Clearing & Outlet Passes", "Save Technique"], startTime: 0, notes: "Each save runs through the post-save moment so you can freeze on the outlet read after every stop." },
  { id: "e6NDm6cA76I", title: "Goalie Breakdown: Maryland vs Boston College", channel: "LM Training", source: "D1 Film Breakdown", category: "girls_goalie", subcategory: "Goalie Skills", concepts: ["Communication & Directing the Defense", "Clearing & Outlet Passes"], startTime: 110, notes: "George Mason goalie coach breaks down 2019 D1 film: communication on the dodge, staying set, the outlet." },
  { id: "b9PLh9URVhk", title: "Goalies Feature (ACC Network Extra)", channel: "Boston College Athletics", source: "D1 Game Film", category: "girls_goalie", subcategory: "Goalie Skills", concepts: ["Positioning & Arc Play"], startTime: 0, notes: "Official BC Athletics feature on the goalie tandem and their daily warm-up build." },
  { id: "EvA0JZL5k_Y", title: "Taylor Cummings: The Draw — Push Right, Pull Left", channel: "USA Lacrosse", source: "D1 Player Session", category: "girls_draws", subcategory: "Draw Technique", concepts: ["Draw Technique"], startTime: 0, notes: "Three-time Tewaaraton winner teaches push and pull draws live at LaxCon: grip at the plastic, wrist turn, placement." },
  { id: "Sq1gczZwBWw", title: "The Mechanics of the Draw (IWLCA / Louisville)", channel: "IWLCA", source: "D1 Coach Clinic", category: "girls_draws", subcategory: "Draw Technique", concepts: ["Draw Technique"], startTime: 0, notes: "Louisville's draw team walks through stance, hand placement, wrist turn and placement, then drills." },
  { id: "u9eYaW06iv0", title: "How to Win a Draw Control: The Irish Way", channel: "Notre Dame Fighting Irish", source: "D1 Practice", category: "girls_draws", subcategory: "Draw Technique", concepts: ["Draw Technique"], startTime: 0, notes: "Notre Dame's draw specialist: read the ball placement, turn the wrist to the sky first, push or place and track." },
  { id: "n9sj-84PpXo", title: "2026 National Championship Draw Control Highlights", channel: "Faceoff Zone", source: "D1 Game Film", category: "girls_draws", subcategory: "Draw Technique", concepts: ["Draw Technique", "Wing Play & Positioning", "Ground Ball Situations Post-Draw"], startTime: 0, notes: "Every draw from the 2026 title game, Northwestern vs UNC, under pressure." },
  { id: "Cy_YE68EQJo", title: "Cathy Reese at LaxCon: Motion Offense", channel: "USA Lacrosse", source: "D1 Coach Clinic", category: "girls_offense", subcategory: "Settled Offense", concepts: ["Cutting to Space", "Spacing & Spreading the Field"], startTime: 0, notes: "Maryland HC: continuous cutting, move after you pass, replace the space a cutter vacates." },
  { id: "9plufBM3QhQ", title: "How to Get Open: Boston College's Jenn Medjid", channel: "First Class Lacrosse", source: "D1 Film Breakdown", category: "girls_offense", subcategory: "Settled Offense", concepts: ["Cutting to Space"], startTime: 0, notes: "2023 tournament film: Medjid times her cut off ball movement while a teammate clears the space." },
  { id: "i_CUGFgQ2XE", title: "\"Jump Cuts\" Drill — Jenny Levy", channel: "Championship Productions", source: "D1 Practice", category: "girls_offense", subcategory: "Settled Offense", concepts: ["Cutting to Space", "Drive & Dish"], startTime: 0, notes: "UNC: feeder drives from behind and pulls to the corner while the cutter times a hard jump cut through the 8." },
  { id: "fKeWvahwX4M", title: "2026 National Championship Highlights: Northwestern vs UNC", channel: "NCAA Championships", source: "D1 Game Film", category: "girls_offense", subcategory: "Settled Offense", concepts: ["Cutting to Space", "Drive & Dish"], startTime: 0, notes: "Madison Taylor feeding inside cutters who time their cuts into the middle of the 8 and finish." },
  { id: "80ksGpgaLAs", title: "Nicole Levy Paints All 4 Corners on Free Positions", channel: "Lacrosse Film Room", source: "D1 Game Film", category: "girls_offense", subcategory: "Shooting", concepts: ["Free Position Shots (8-Meter)"], startTime: 0, notes: "Syracuse attacker goes 4 for 4 on 8-meters vs Albany, a different corner every time." },
  { id: "4RQb8XpEQ4Y", title: "Film Breakdown: 8-Meter Feeding from the NCAA Tournament", channel: "First Class Lacrosse", source: "D1 Film Breakdown", category: "girls_offense", subcategory: "Shooting", concepts: ["Free Position Shots (8-Meter)", "Reading Defensive Setups"], startTime: 0, notes: "Shooter sells the shot and feeds the adjacent or crease teammate. Shot-fake-to-feed reads on tournament film." },
  { id: "ql3TkAMz95M", title: "Chloe Humphrey Scores 7 vs Florida, NCAA Semifinal", channel: "First Class Lacrosse", source: "D1 Game Film", category: "girls_offense", subcategory: "Shooting", concepts: ["Free Position Shots (8-Meter)", "On-the-Run Shooting"], startTime: 0, notes: "All seven UNC goals: free-position conversions, look-offs on the goalie, two-handed finishes in tight." },
  { id: "6nbBjn26MaE", title: "Charlotte North Breaks the Single-Season Goal Record", channel: "NCAA Championships", source: "D1 Game Film", category: "girls_offense", subcategory: "Shooting", concepts: ["On-the-Run Shooting", "Overhand Shot"], startTime: 0, notes: "All six BC goals in the 2021 title game, several top-lane rips off a sweep before the slide arrives." },
  { id: "bP4i9TY9pdo", title: "Film Room: Kayla Treanor vs Notre Dame's Defenders", channel: "Lacrosse Film Room", source: "D1 Film Breakdown", category: "girls_offense", subcategory: "Dodging", concepts: ["Face Dodge", "Roll Dodge"], startTime: 0, notes: "Treanor's face and pull dodges and their counters against elite D1 on-ball defense." },
  { id: "qyasMxHvlfY", title: "Kayla Treanor Scores with a Rocker Step", channel: "Lacrosse Film Room", source: "D1 Game Film", category: "girls_offense", subcategory: "Dodging", concepts: ["Roll Dodge", "Change of Direction Dodge"], startTime: 0, notes: "Works off the roll dodge from the crease, sells the rocker step, rolls and finishes." },
  { id: "JjlvkTuyQJk", title: "Jen Adams' Stutter Step", channel: "USA Lacrosse", source: "D1 Coach Clinic", category: "girls_offense", subcategory: "Dodging", concepts: ["Change of Direction Dodge", "Speed Dodge (no contact environment)"], startTime: 0, notes: "Loyola HC: short explosive steps to freeze the defender, stick moves with the feet, explode on the bite." },
  { id: "Dvl-pSE9oOE", title: "Izzy Scane Beats the Double Team and Scores", channel: "Eustace Tarwater", source: "D1 Game Film", category: "girls_offense", subcategory: "Dodging", concepts: ["Reading Defensive Setups", "Change of Direction Dodge"], startTime: 0, notes: "Trapped in a two-defender double, keeps her feet moving, protects the stick, splits the seam and finishes." },
  { id: "HV6W_U4bQP4", title: "Cathy Reese at LaxCon: Sidearm Passing", channel: "USA Lacrosse", source: "D1 Coach Clinic", category: "girls_fundamentals", subcategory: "Stick Skills", concepts: ["Passing Accuracy"], startTime: 0, notes: "Maryland HC on sidearm throwing mechanics with Terps assistants demonstrating." },
  { id: "_8n0B6BabeY", title: "Cathy Reese at LaxCon: Stick Work Progression", channel: "USA Lacrosse", source: "D1 Coach Clinic", category: "girls_fundamentals", subcategory: "Stick Skills", concepts: ["Passing Accuracy", "Cradling (women's pocket rules)"], startTime: 0, notes: "Layered throwing progression: both hands, changing release points, on the move." },
  { id: "v-8msOq9Dj0", title: "Shuffling Partner Pass — Northwestern Practice", channel: "Championship Productions", source: "D1 Practice", category: "girls_fundamentals", subcategory: "Stick Skills", concepts: ["Catching on the Move"], startTime: 0, notes: "Wildcats shuffle the width of the field passing five yards apart: fast hands, stay low, do not rush." },
  { id: "w8njFThpf2A", title: "Championship Practice Ground Ball Drills — Jenny Levy", channel: "Championship Productions", source: "D1 Practice", category: "girls_fundamentals", subcategory: "Stick Skills", concepts: ["Ground Balls"], startTime: 0, notes: "UNC's daily 3v2 and 2v2 competitive ground ball drills: choke up, box out, win it under pressure, pass out of the double." },
  { id: "ndz_ZQXrexs", title: "Ground Balls at the Goal with Emily Kenul", channel: "USA Lacrosse", source: "D1 Coach Clinic", category: "girls_fundamentals", subcategory: "Stick Skills", concepts: ["Ground Balls"], startTime: 0, notes: "Johns Hopkins attacker on rebounds and 50/50s in front of the goal: body position, scoop through, finish." },
  { id: "y-Vrbj53Bh4", title: "Wall Ball with Lizzie Colson", channel: "Women's Lacrosse League", source: "D1 Player Session", category: "girls_fundamentals", subcategory: "Stick Skills", concepts: ["Cradling (women's pocket rules)", "Passing Accuracy"], startTime: 0, notes: "Two-time Maryland champion: movement-based wall ball with one-handed right and left catch-and-throws." },
  { id: "qD-VTfZ-i8s", title: "Taylor Cummings Wall Ball Routine", channel: "Taylor Cummings", source: "D1 Player Session", category: "girls_fundamentals", subcategory: "Stick Skills", concepts: ["Passing Accuracy"], startTime: 0, notes: "Full pre-season routine: righty and lefty reps hitting the same brick, cross-body, off-stick side, one-handed." },

];

// ============= GAME ARCHIVE DATA =============
// Real NCAA Division I games the Concept Library draws from. No sample data.
const GAME_ARCHIVE = [
  { id: 'yale-duke-2018-final', title: 'Yale vs Duke', date: '2018 NCAA Championship', program: 'boys', type: 'Film Breakdown',
    concepts: ['Slide Recovery', 'Communication & Calls'], videoId: '6doDKTgpzvg',
    summary: "Duke's first possession of the title game. Yale's off-ball defenders talk, hedge, slide once, and recover to force the turnover." },
  { id: 'nd-umd-2023', title: 'Notre Dame vs Maryland', date: '2023 Regular Season', program: 'boys', type: 'Film Breakdown',
    concepts: ['Crease Slides', 'Slide Recovery', 'Backside Rotation'], videoId: 'xA8aErPf7To',
    summary: "One full telestrated Notre Dame defensive possession: crease slide, pass-off, fire to X, inside-out recovery." },
  { id: 'nd-duke-2023-mandown', title: 'Notre Dame vs Duke', date: '2023 Regular Season', program: 'boys', type: 'Game Clip',
    concepts: ['Rotation Packages'], videoId: 'T_6abjxKKE8',
    summary: "The national champions kill a Duke extra-man with a four-man box rotation. Duke never gets a shot off." },
  { id: 'nd-denver-2024-semi', title: 'Notre Dame vs Denver', date: '2024 NCAA Semifinal', program: 'boys', type: 'Film Breakdown',
    concepts: ['Adjacent Slides', 'Communication & Calls'], videoId: 'cfvDsyJkplk',
    summary: "On-ball hold, near-side hedge, adjacent slide, and the rotation behind it from the semifinal in Philadelphia." },
  { id: 'cuse-duke-2024-mandown', title: 'Syracuse vs Duke', date: '2024 Regular Season', program: 'boys', type: 'Film Breakdown',
    concepts: ['Pressure vs Contain', 'Rotation Packages'], videoId: 'kyC0UI2Ru44',
    summary: "Syracuse's five-man man-down unit holds #3 Duke 0-for-2 with pressure on the ball and a collapsing backside." },
  { id: 'umd-cuse-2025', title: 'Maryland vs Syracuse', date: '2025 Regular Season', program: 'boys', type: 'Film Breakdown',
    concepts: ['Adjacent Slides', 'Backside Rotation'], videoId: 'bXz6dVXlz8g',
    summary: "How Maryland held Syracuse to seven goals: adjacent support, hedging over crease slides, backside fills." },
  { id: 'uva-mich-2024', title: 'Virginia vs Michigan', date: '2024 Regular Season', program: 'boys', type: 'Film Breakdown',
    concepts: ['Pick Plays', 'Two-Man Game', 'Defending Picks & 2-Man Games'], videoId: 'j9kSgEEjo4U',
    summary: "Five Virginia goals off picks at X, the wing, and up top. Study it from both sides of the ball." },
  { id: 'umd-duke-2013-zone', title: 'Maryland vs Duke', date: '2013 ACC Regular Season', program: 'boys', type: 'Game Clip',
    concepts: ['3-3 Zone', 'Zone Principles & Rotations'], videoId: 'pYdDg-Vz5UQ',
    summary: "Maryland drops into a 3-3 zone for a possession. Watch the shell shift on every pass." },
  { id: 'cornell-umd-2025', title: 'Cornell vs Maryland', date: '2025 NCAA Championship', program: 'boys', type: 'Highlights',
    concepts: [], videoId: 'l0cJ-2UmGlI',
    summary: "Championship game highlights. Pair it with the Concept Library: pick a concept, then find it in the game." }
  // Girls games are added as verified women's D1 film lands.
];

// ============= UTILITY FUNCTIONS =============

function getConceptName(item) {
  return typeof item === 'string' ? item : item.name;
}

function isConceptActive(item) {
  return typeof item === 'object' && item.active === true;
}

function getTaxonomy(program) {
  return program === 'boys' ? BOYS_TAXONOMY : GIRLS_TAXONOMY;
}

function getConceptContent(program, conceptName) {
  const programContent = CONCEPT_CONTENT[program];
  const base = programContent ? programContent[conceptName] : null;
  const content = base ? Object.assign({}, base) : null;

  // Attach library clips by EXACT concept match (v.concepts array or v.concept string)
  let clips = [];
  if (typeof VIDEO_LIBRARY !== 'undefined') {
    const prefix = program === 'boys' ? 'boys_' : 'girls_';
    clips = VIDEO_LIBRARY.filter(v => {
      if (!v.category || !v.category.startsWith(prefix)) return false;
      if (Array.isArray(v.concepts)) return v.concepts.includes(conceptName);
      return v.concept === conceptName;
    }).map(v => ({ id: v.id, title: v.title, notes: v.notes, startTime: v.startTime || 0, channel: v.channel, source: v.source }));
  }

  const inline = (content && Array.isArray(content.videos)) ? content.videos : [];
  const seen = new Set();
  const videos = [...inline, ...clips].filter(v => {
    const key = `${v.id}_${v.startTime || 0}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (!content && videos.length === 0) return null;
  const out = content || {};
  out.videos = videos;
  return out;
}

// Does this concept have anything to show (clips or notes)?
function conceptHasContent(program, conceptName) {
  const c = getConceptContent(program, conceptName);
  return !!(c && ((c.videos && c.videos.length) || c.dev || c.int || c.adv));
}

function countConceptsWithFilm(program) {
  const tax = getTaxonomy(program);
  let n = 0;
  Object.values(tax).forEach(cat => Object.values(cat.subcategories).forEach(items => items.forEach(item => {
    const c = getConceptContent(program, getConceptName(item));
    if (c && c.videos && c.videos.length) n++;
  })));
  return n;
}

function getVideosForCategory(category) {
  if (typeof VIDEO_LIBRARY === 'undefined') return [];
  return VIDEO_LIBRARY.filter(v => v.category === category);
}

function getVideoCount(program) {
  if (typeof VIDEO_LIBRARY === 'undefined') return 0;
  const prefix = program === 'boys' ? 'boys_' : 'girls_';
  return VIDEO_LIBRARY.filter(v => v.category.startsWith(prefix)).length;
}

function countConcepts(taxonomy) {
  let total = 0;
  let active = 0;
  Object.values(taxonomy).forEach(cat => {
    Object.values(cat.subcategories).forEach(items => {
      items.forEach(item => {
        total++;
        if (isConceptActive(item)) active++;
      });
    });
  });
  return { total, active };
}

// ============= PHASE → TAXONOMY MAPPER =============
const PHASE_TO_TAXONOMY = {
  // Boys mappings
  'Offense - Settled 6v6':              { category: 'offense', subcategory: 'Settled Offense' },
  'Offense - Early Offense / Transition': { category: 'offense', subcategory: 'Transition Offense' },
  'Offense - EMO':                      { category: 'offense', subcategory: 'Extra Man Offense (EMO)' },
  'Defense - Settled 6v6':              { category: 'defense', subcategory: 'Team Defense / Slides' },
  'Defense - Recovery':                 { category: 'defense', subcategory: 'Man-to-Man Defense' },
  'Defense - Man Down':                 { category: 'defense', subcategory: 'Man-Down Defense' },
  'Faceoff':                            { category: 'faceoffs', subcategory: 'Face-Off Technique' },
  'Clear':                              { category: 'offense', subcategory: 'Clearing' },
  'Ride':                               { category: 'defense', subcategory: 'Riding (Preventing Clears)' },
  // Girls mappings (same phases, different taxonomy)
  'girls_Offense - Settled 6v6':        { category: 'offense', subcategory: 'Settled Offense' },
  'girls_Offense - Early Offense / Transition': { category: 'offense', subcategory: 'Transition Offense' },
  'girls_Offense - EMO':                { category: 'offense', subcategory: 'Player-Up Offense' },
  'girls_Defense - Settled 6v6':        { category: 'defense', subcategory: 'Team Defense' },
  'girls_Defense - Recovery':           { category: 'defense', subcategory: 'Defensive Transition' },
  'girls_Defense - Man Down':           { category: 'defense', subcategory: 'Team Defense' },
};

// Extract YouTube video ID from a URL
function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Convert sheet events into VIDEO_LIBRARY-compatible entries
function sheetEventsToVideos(events) {
  return events.map(e => {
    const videoId = extractVideoId(e.youtube_url || e.youtube_deep_link || '');
    if (!videoId) return null;

    const startSeconds = parseInt(e.source_start_seconds) || 0;
    const phase = e.phase || '';
    const mapping = PHASE_TO_TAXONOMY[phase] || { category: 'team', subcategory: 'Game Management' };
    const program = (e.team_focus === 'defense') ? 'boys' : 'boys'; // default boys, override for girls source_type

    return {
      id: videoId,
      title: `${e.event_summary || 'Game Clip'}`,
      channel: e.game_title || 'NCAA Game',
      category: `${program}_${mapping.category}`,
      subcategory: mapping.subcategory,
      concept: e.category || '',
      startTime: startSeconds,
      notes: e.main_teaching_point || e.event_summary || '',
      gameTitle: e.game_title || '',
      playResult: e.play_result || '',
      period: e.period || '',
      confidence: e.ai_confidence || 0,
      fromSheet: true
    };
  }).filter(Boolean);
}

// Fetch events from Google Sheet and merge into VIDEO_LIBRARY
async function loadSheetClips() {
  try {
    const url = `${BTB_CONFIG.filmStudyDataUrl}?action=list_events`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Sheet fetch failed');
    const data = await response.json();

    if (data.events && data.events.length > 0) {
      const sheetVideos = sheetEventsToVideos(data.events);
      // Merge into VIDEO_LIBRARY (avoid duplicates by checking id + startTime)
      const existingKeys = new Set(VIDEO_LIBRARY.map(v => `${v.id}_${v.startTime}`));
      sheetVideos.forEach(v => {
        const key = `${v.id}_${v.startTime}`;
        if (!existingKeys.has(key)) {
          VIDEO_LIBRARY.push(v);
          existingKeys.add(key);
        }
      });
      console.log(`Loaded ${sheetVideos.length} clips from Google Sheet (${VIDEO_LIBRARY.length} total)`);
      return sheetVideos.length;
    }
    return 0;
  } catch (err) {
    console.warn('Could not fetch sheet clips:', err.message);
    return 0;
  }
}

// ============= GOOGLE SHEET DATA FETCH =============
async function fetchSheetData(program = 'all') {
  try {
    const url = `${BTB_CONFIG.filmStudyDataUrl}?action=read&program=${encodeURIComponent(program)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Sheet fetch failed');
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('Could not fetch Google Sheet data:', err.message);
    return null;
  }
}

// ============= YOUTUBE EMBED HELPER =============
function createYouTubeEmbed(videoId, startTime = 0) {
  const params = startTime > 0 ? `?start=${startTime}&rel=0` : '?rel=0';
  return `<iframe src="https://www.youtube.com/embed/${videoId}${params}"
    title="BTB Film Clip" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen loading="lazy"></iframe>`;
}

function createVideoCard(videoId, title, notes, startTime = 0, channel = '', source = '') {
  const badge = source ? `<span class="clip-badge">${source}</span>` : '';
  const chan = channel ? `<span class="clip-channel">${channel}</span>` : '';
  const ts = startTime > 0 ? `<span class="clip-ts">Starts ${Math.floor(startTime/60)}:${String(startTime%60).padStart(2,'0')}</span>` : '';
  return `
    <div class="video-card">
      <div class="video-container">
        ${videoId ? createYouTubeEmbed(videoId, startTime) : '<div class="video-placeholder">Video Coming Soon</div>'}
      </div>
      <div class="coaching-notes">
        <div class="clip-meta">${badge}${chan}${ts}</div>
        <h4>${title || 'Film Clip'}</h4>
        <p>${notes || ''}</p>
      </div>
    </div>
  `;
}

// ============= EXPORT FOR MODULES =============
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BTB_CONFIG, BOYS_TAXONOMY, GIRLS_TAXONOMY,
    CONCEPT_CONTENT, GAME_ARCHIVE,
    getConceptName, isConceptActive, getTaxonomy,
    getConceptContent, conceptHasContent, countConceptsWithFilm, countConcepts, fetchSheetData,
    createYouTubeEmbed, createVideoCard
  };
}
