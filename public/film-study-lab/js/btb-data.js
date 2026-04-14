/* ================================================
   BTB FILM STUDY LAB — Data Layer
   Taxonomy, Google Sheet integration, state management
   ================================================ */

// ============= GOOGLE SHEET WEBHOOK CONFIG =============
const BTB_CONFIG = {
  webhookUrl: 'https://script.google.com/macros/s/AKfycbyLz8IzFau00mve4vCxSbtpGAKHmZRHFhXx-Dx6qUGrM9Yz8wqGU3HLiYeGxyvlXnEpCw/exec',
  apiKey: 'BTB_SECRET_123',
  localServer: 'http://localhost:8765'
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
        { name: 'Adjacent Slides', active: true },
        'Crease Slides', 'Backside Rotation',
        'Slide Recovery', 'Communication & Calls'
      ],
      'Zone Defense': [
        'Backer Zone', '3-3 Zone', 'Zone Principles & Rotations'
      ],
      'Man-to-Man Defense': [
        'On-Ball Footwork & Positioning', 'Approach Technique',
        'Body Positioning & Leverage', 'Trail Technique'
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
        'Face Dodge', 'Change of Direction Dodge', 'Pull Shot Dodge'
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
  boys: {
    'Split Dodge': {
      dev: {
        label: '2nd-5th Grade Level',
        text: 'A split dodge is when you switch hands while changing direction to get past a defender. Think of it like a basketball crossover!',
        points: ['Plant one foot hard', 'Switch the stick to your other hand', 'Explode in the opposite direction'],
        activity: 'Get a ball and practice switching hands while running in a straight line. Then add a cone and practice dodging around it.'
      },
      int: {
        label: '6th-8th Grade Level',
        text: 'The split dodge uses a hard plant-and-switch at the point of attack. The key is selling the initial direction before exploding the opposite way. Watch the attackman\'s hips — that\'s what commits the defender.',
        points: ['Approach at game speed with head up', 'Show the defender you\'re going one way (commitment step)', 'Plant the outside foot hard', 'Switch hands at hip level, not overhead', 'Accelerate away from the defender'],
        mistakes: 'Switching hands too high (stick exposed to checks), not committing to the initial direction, switching too early.'
      },
      adv: {
        label: '9th-11th Grade Level',
        text: 'Watch how the X attackman in this film sets up the split dodge with a hesitation step to freeze the defender\'s hips. The hand switch happens at the hip-height plane, not overhead, keeping the stick protected. Notice how the dodge is initiated from 5 yards above GLE to create a shooting angle.',
        points: ['Use hesitation step to manipulate defender\'s momentum', 'Hand switch in plane of hips keeps stick safe from checks', 'Dodge from high position (5+ yards GLE) to keep shot ready', 'Timing the dodge with off-ball movement creates passing lanes', 'Reading slide defense — when to shoot vs when to pass'],
        filmCues: 'Watch foot placement and hip rotation. Elite attackmen use minimal stick movement and maximum body deception. Study how the defender\'s eyes lock onto the initial direction.'
      }
    },
    'Backdoor Cuts': {
      dev: {
        label: '2nd-5th Grade Level',
        text: 'A backdoor cut is when you run behind your defender to get open. You fake like you\'re going one way, then cut behind them for an easy catch and score!',
        points: ['Get your defender\'s attention', 'Quick cut behind them', 'Be ready to catch and shoot']
      },
      int: {
        label: '6th-8th Grade Level',
        text: 'The backdoor cut exploits overplaying or poor positioning. You need timing between the cutter and the passer. The cut should happen when the ball is in flight or just after a pass.',
        points: ['Establish position (face your defender)', 'Make a fake move to draw their attention', 'Explode cut behind them to the goal line', 'Time your movement with passer\'s release', 'Finish with shot or pass']
      },
      adv: {
        label: '9th-11th Grade Level',
        text: 'The backdoor cut is a high-efficiency offensive action. It\'s effective against tight man-to-man coverage. The passer must recognize the cutting opportunity and the cutter must explode at the right moment to stay onside and get shot off before slide.',
        points: ['Read defender positioning and proximity', 'Use contact (shoulder) to establish space', 'Timing relative to ball movement, not defender', 'Sequence backdoor cuts with other offensive actions', 'Recognize when slide is coming and reset']
      }
    },
    'Fast Breaks (4v3, 3v2)': {
      dev: {
        label: '2nd-5th Grade Level',
        text: 'A fast break is when your team gets more players down the field than the other team. It\'s a great chance to score! Run fast, pass the ball, and shoot.',
        points: ['More attackers than defenders = fast break', 'Run down the field quickly', 'Pass to the open player', 'Get a good shot']
      },
      int: {
        label: '6th-8th Grade Level',
        text: 'Fast breaks win games. In a 4v3, use spacing and ball movement to create a shot before the defense can set. The middle player is usually the best shot-taker. Kick out to shooters on the edges if defense collapses.',
        points: ['One player in the middle (primary shot)', 'Two wings (outlet options)', 'One trailer (insurance / secondary break)', 'Pass to open player, don\'t dribble unnecessarily']
      },
      adv: {
        label: '9th-11th Grade Level',
        text: 'Fast breaks are the most efficient offensive action. Execute with minimal touches before shot. In 4v3, the middle attackman should shoot within 2 passes. Recognize when the 4th attacker can leak out. 3v2 situations require one-touch passes and immediate shooting.',
        points: ['Inside position (closest to goal) takes the shot', 'Shot within 2 passes in 4v3', '3v2 one-pass shot rule', 'Read defense for skip passes', 'High-efficiency looks only (don\'t settle)']
      }
    },
    'Adjacent Slides': {
      dev: {
        label: '2nd-5th Grade Level',
        text: 'When the person with the ball dodges toward you, you "slide" — you run over to stop them. Your teammate then slides down to cover the person you were guarding. It\'s like passing your player to your teammate!',
        points: ['Defender 1 slides to the ball', 'Defender 2 slides to Defender 1\'s player', 'Keep sliding until everyone is covered']
      },
      int: {
        label: '6th-8th Grade Level',
        text: 'Adjacent slides are the foundation of team defense. When a dodge happens, the closest defender slides to ball while their adjacent neighbor rotates down. Communication is critical — loud, clear calls keep everyone connected.',
        points: ['Identify the dodge direction early', 'Slide defender angles hard to the ball carrier', 'Adjacent defender reads and rotates', 'Call out player ("Ball!" or "Two!")', 'Recover to tight coverage quickly']
      },
      adv: {
        label: '9th-11th Grade Level',
        text: 'Adjacent slides must happen in reaction to the dodge, not in anticipation. Read the shoulder and hip commitment of the dodger. The slide defender must take away the space angle while adjacent defender reads the open attackman and closes out high. Wall the ball carrier off from shooting area.',
        points: ['Slide angle depends on GLE proximity (steeper near goal)', 'Adjacent defender gap responsibility before rotating', 'Backside recovery — don\'t over-commit on slide', 'Read skip passes during slide rotations', 'Tempo of slides must match dodge speed']
      }
    },
    '10-Man Ride': {
      dev: {
        label: '2nd-5th Grade Level',
        text: 'A ride is when your team is spread out across the field trying to stop the other team from clearing the ball. Everyone helps!',
        points: ['Defense stays spread out after a goal', 'Try to force bad passes', 'Get the ball back quickly']
      },
      int: {
        label: '6th-8th Grade Level',
        text: 'A 10-man ride uses all field players to pressure the clear. Space riders to force sideline clears or turnovers. High pressure on the ball carrier while other riders cover passing lanes.',
        points: ['Two crease attackers pressure ball', 'Two mid-field riders pressure midfield passing lanes', 'Two wing riders cover sideline', 'Remaining players back-fill the clear', 'Goalie directs traffic']
      },
      adv: {
        label: '9th-11th Grade Level',
        text: '10-man rides are high-risk, high-reward. They work best after goals when the clearing team is reactive. Set up to force specific areas (sidelines) and sequence pressure so riders can recover.',
        points: ['Channel to sideline, not middle', 'Pressure point of attack at GLE', 'Midfield riders cover slip passes', 'Tempo: aggressive to forced mistakes or transition back', 'Secondary break if turnover occurs']
      }
    },
    'Motion Offense': {
      dev: {
        label: '2nd-5th Grade Level',
        text: 'Motion offense means everyone keeps moving! Nobody stands still. You pass and cut, making it really hard for the defense to keep up.',
        points: ['Always move after you pass', 'Cut to open space', 'Keep the ball moving', 'Don\'t stand and watch']
      },
      int: {
        label: '6th-8th Grade Level',
        text: 'Motion offense is built on constant player and ball movement. The system creates natural mismatches and open shots through spacing, cutting, and ball reversal. Every player touches the ball.',
        points: ['Pass and immediately cut or replace', 'Fill vacated spots to maintain spacing', 'Read the defense — cut to open space', 'Ball reversal changes the defense\'s focus', 'Attack when the defense is shifting']
      },
      adv: {
        label: '9th-11th Grade Level',
        text: 'At the college level, motion offense creates advantages through disciplined spacing and movement patterns. The offense reads defensive positioning to determine whether to dodge, feed, or continue ball movement. Film study is critical — learn to read slide packages.',
        points: ['Recognize slide tendencies from film', 'Use ball reversal to shift defensive structure', 'Attack during defensive rotation (not after)', 'Two-man game concepts within motion framework', 'Shot clock awareness — when to push vs when to reset'],
        filmCues: 'Watch how top-side passes create dodge angles. Study how off-ball players time their cuts to coincide with the ball carrier\'s decision point.'
      },
      videos: [
        { id: 'oSKdetJt2pA', title: 'Motion Offense Overview', notes: 'Core concepts of spacing and ball movement' },
        { id: 'H9aNp7-z_bE', title: 'Fade Cut in Motion', notes: 'How the fade creates space for the dodger' },
        { id: 'f8un6ZHXNhM', title: 'Follow Action', notes: 'Follow the pass for give-and-go opportunities' },
        { id: 'j2ECYQVTliw', title: 'Cut & Clear Patterns', notes: 'Reading when to cut through and when to clear out' },
        { id: 'bmrk8QIyI3A', title: 'Pick & Slip Concepts', notes: 'Setting and using screens within the motion framework' },
        { id: 'guGArNEQaM0', title: 'Full System Integration', notes: 'Putting it all together — multiple actions in sequence' }
      ]
    }
  },
  girls: {
    'Behind-the-Cage Offense': {
      dev: {
        label: '2nd-5th Grade Level',
        text: 'Behind-the-cage offense means the ball is behind the goal line. From there, you can make good passes to open teammates for easy shots!',
        points: ['Drive the ball to X (behind goal)', 'Look for cutters in front', 'Pass to open player for easy finish']
      },
      int: {
        label: '6th-8th Grade Level',
        text: 'Behind-the-cage is one of the most powerful positions in girls lacrosse. The X player has a wide field of vision and can deliver quick passes to cutters. Timing between the X player and cutters is crucial.',
        points: ['Drive hard to behind-the-goal position', 'Protect the ball from defense', 'Read all cutting options', 'Hit cutters with quick, accurate passes', 'Know when to look for free position']
      },
      adv: {
        label: '9th-11th Grade Level',
        text: 'Elite X players score 25%+ of team goals. The behind-the-cage position demands spatial awareness, passing accuracy, and decision-making under pressure. Use ball fakes to open passing lanes.',
        points: ['Footwork to escape initial defender', 'Multiple pass destinations within 1 second', 'Free position awareness (8-meter threat)', 'Reversing the ball across the cage', 'Timing with off-ball movement']
      }
    },
    'Free Position Shots (8-Meter)': {
      dev: {
        label: '2nd-5th Grade Level',
        text: 'In girls lacrosse, if a player is fouled near the goal, she gets a free shot! It\'s like a basketball free throw but with a lacrosse stick.',
        points: ['You get fouled near the goal', 'No one can defend you right away', 'Take your time and shoot', 'Practice makes perfect!']
      },
      int: {
        label: '6th-8th Grade Level',
        text: 'Free position shots are automatic scoring opportunities. Accuracy is everything. Practice consistency from the 8-meter arc.',
        points: ['Plant your feet at the 8-meter line', 'Cradle to position the stick', 'Focus on the back of the net', 'Follow through toward the goal', 'Placement over power']
      },
      adv: {
        label: '9th-11th Grade Level',
        text: 'Elite free position shooters hit 80%+. Vary shot angles and placement to keep goalies honest. Use release variations. Factor in goalie positioning and angle tendencies.',
        points: ['Placement accuracy (top shelf, far side) > speed', 'Read goalie pre-shot positioning', 'Multiple release options within 1 second', 'Angle selection based on distance', 'Psychological confidence (pressure situations)']
      }
    },
    'Fast Breaks': {
      dev: {
        label: '2nd-5th Grade Level',
        text: 'A fast break is when your team has more players than the defense, so you run fast and score! Quick passes help you get to the goal.',
        points: ['Get the ball and run downfield fast', 'More attackers than defenders', 'Pass to teammates who are open', 'Shoot and score!']
      },
      int: {
        label: '6th-8th Grade Level',
        text: 'Girls fast breaks are high-tempo. Numbers advantage (3v2, 4v3) should result in goals. Use spacing and ball movement.',
        points: ['Spread the field (not bunched)', 'High player (closest to goal) ready to shoot', 'Wings on the perimeter', 'Minimal ball touches before shot', 'One-pass shots in 3v2']
      },
      adv: {
        label: '9th-11th Grade Level',
        text: 'Women\'s fast breaks emphasize spacing and shot selection. In 3v2, get a shot in one pass. In 4v3, two passes max. No dribbling unless necessary.',
        points: ['Fill lanes immediately off transition', 'High player angles toward goal for scoring', 'No low-percentage perimeter shots', 'Reset if defense sets (transition to set play)', 'Outlet pass quality from clearing team']
      }
    },
    'Draw Technique': {
      dev: {
        label: '2nd-5th Grade Level',
        text: 'In girls lacrosse, instead of face-offs, two players try to control the ball at center. It\'s called a draw! The player who controls it gives her team the ball.',
        points: ['Two players stand at center', 'Ball is between the sticks', 'Try to control it to your side', 'Fastest player wins']
      },
      int: {
        label: '6th-8th Grade Level',
        text: 'The draw is the start of possession. Good draw technique gives your team the ball. Footwork, hand positioning, and scooping speed matter.',
        points: ['Balanced stance before whistle', 'Quick draw motion (low to high)', 'Protect the stick and ground ball', 'Wings positioned for support', 'Outlet pass to nearest teammate']
      },
      adv: {
        label: '9th-11th Grade Level',
        text: 'Elite draws set team possession rhythm. Control the draw and your team scores more. Explosive first step off the whistle and precise technique.',
        points: ['Plant and explode mechanics (lower body power)', 'Stick angle optimization', 'Wing positioning for numbers advantage', 'Set plays off draw control (fast break vs reset)', 'Draw match-up tendencies and personnel']
      }
    }
  }
};

// ============= VIDEO LIBRARY =============
// 44 verified YouTube videos mapped to taxonomy categories
const VIDEO_LIBRARY = [
  // ── BOYS DEFENSE: Team Defense / Slides ──
  { id: 'TsTgsq2vcPE', title: 'Adjacent Slide Basics', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Team Defense / Slides', concept: 'Adjacent Slides', startTime: 0, notes: 'Fundamentals of adjacent sliding — when and how to rotate one pass away on defense.' },
  { id: 'JITcbrt8g8M', title: 'Crease Slide Basics', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Team Defense / Slides', concept: 'Crease Slides', startTime: 0, notes: 'Crease slide responsibilities and how the crease defender rotates to the ball carrier.' },
  { id: 'TL__YxdGSKQ', title: 'Near Man Defense', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Team Defense / Slides', concept: 'Communication & Calls', startTime: 0, notes: 'Near-man defensive philosophy where the closest defender slides to the ball.' },
  { id: 'rKZU6IMtJvo', title: 'Defending 2-Man Games', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Team Defense / Slides', concept: 'Slide Recovery', startTime: 0, notes: 'Defending pick-and-roll / two-man games with proper switches and communication.' },
  { id: '3802fpuzdkE', title: '2-Man Game Pick Locations', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Team Defense / Slides', concept: 'Adjacent Slides', startTime: 0, notes: 'Common pick locations and how to anticipate and defend each one.' },
  { id: 'qcN0RdFFF_M', title: 'Executing & Defending 2-Man Games (Full)', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Team Defense / Slides', concept: 'Backside Rotation', startTime: 0, notes: 'Comprehensive 1:51 deep dive on two-man games from both sides of the ball.' },
  { id: 'fwKoKVTOt7s', title: 'Building D with 3v0s/3v2s/3v3s', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Team Defense / Slides', concept: 'Communication & Calls', startTime: 0, notes: 'Progressive small-sided drills building offensive and defensive concepts.' },

  // ── BOYS DEFENSE: Zone ──
  { id: 'MQEnQtZem-o', title: 'Wesleyan Championship 3-3 Zone', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Zone Defense', concept: '3-3 Zone', startTime: 0, notes: 'Film breakdown of Wesleyan\'s championship-winning 3-3 zone defense.' },
  { id: 'MWg_b503Ijw', title: 'Wild Cat Trap Zone', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Zone Defense', concept: 'Zone Principles & Rotations', startTime: 0, notes: 'Aggressive trapping zone that pressures the ball and forces turnovers.' },

  // ── BOYS DEFENSE: Man-to-Man ──
  { id: 'xEnD16D8zL0', title: 'Individual Defensive Play', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Man-to-Man Defense', concept: 'On-Ball Footwork & Positioning', startTime: 0, notes: 'Foundation video on body positioning, footwork, and approach angles.' },

  // ── BOYS DEFENSE: Man-Down ──
  { id: 'pev8Lh9e6ng', title: 'Box and 1 Man-Down', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Man-Down Defense', concept: 'Rotation Packages', startTime: 0, notes: 'Box-and-1 man-down scheme with one chaser and four in a box zone.' },
  { id: '9B-DbHoCERg', title: 'House Zone Man-Down', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Man-Down Defense', concept: 'Rotation Packages', startTime: 0, notes: 'House zone man-down setup with specific rotations and slide responsibilities.' },
  { id: 'hrzYFIyQWTI', title: 'Pushin P Man-Down', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Man-Down Defense', concept: 'Pressure vs Contain', startTime: 0, notes: 'Aggressive pressure man-down that disrupts EMO by pushing the ball.' },
  { id: 'R26pAhoXoNA', title: 'Box and Surprise Lock Man-Down', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Man-Down Defense', concept: 'Rotation Packages', startTime: 0, notes: 'Box man-down with a surprise lock call shifting from zone to man-to-man.' },

  // ── BOYS DEFENSE: Riding ──
  { id: '13lgO57WErA', title: 'The Riding Playbook', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Riding (Preventing Clears)', concept: '10-Man Ride', startTime: 0, notes: 'Complete riding system overview covering multiple formations and pressure packages.' },
  { id: 'bjIKPeCmhwc', title: '10 Man Ride', channel: 'POWLAX', category: 'boys_defense', subcategory: 'Riding (Preventing Clears)', concept: '10-Man Ride', startTime: 0, notes: 'Full 10-man ride where all field players pressure the clear aggressively.' },

  // ── BOYS OFFENSE: Settled ──
  { id: 'oSKdetJt2pA', title: 'Duke\'s Fade and Follow', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Settled Offense', concept: 'Motion Offense', startTime: 0, notes: 'Duke\'s signature fade-and-follow motion where the dodger fades and the next man follows.' },
  { id: '3bP1bWdh76Y', title: 'Sweep-Fade-Float Midfield Motion', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Settled Offense', concept: 'Motion Offense', startTime: 0, notes: 'Three-part midfield motion with sweep, fade, and float options off the dodge.' },
  { id: 'f8un6ZHXNhM', title: 'Dodge-Clear Through-Follow Attack Motion', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Settled Offense', concept: 'Motion Offense', startTime: 0, notes: 'Attack motion: dodger initiates, teammate clears through, another follows.' },
  { id: 'j2ECYQVTliw', title: 'Dodge-Follow-Float Midfield Motion', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Settled Offense', concept: 'Motion Offense', startTime: 0, notes: 'Midfield motion where the dodge triggers a follow cut and a float to the backside.' },
  { id: 'H9aNp7-z_bE', title: 'Weave and Mumbo Box Offense', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Settled Offense', concept: 'Motion Offense', startTime: 0, notes: 'Weave and Mumbo offensive sets out of a box formation with continuous motion.' },
  { id: 'R19Zg4xQfYs', title: 'Virginia\'s 2-2-2 from X', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Settled Offense', concept: '1-4-1 Formation', startTime: 0, notes: 'Virginia\'s 2-2-2 formation initiated from X with player-cut perspective.' },
  { id: 'oKk8p4Vx_OA', title: 'Virginia\'s 2-2-2 from X (Coach View)', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Settled Offense', concept: '1-4-1 Formation', startTime: 0, notes: 'Coach\'s perspective breakdown of Virginia\'s 2-2-2 from behind the cage.' },
  { id: '462mJNQyv50', title: '21-12 Motion Offense', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Settled Offense', concept: '2-3-1 Formation', startTime: 0, notes: 'Quick overview of the 21-12 motion offense with movement and passing reads.' },

  // ── BOYS OFFENSE: Off-Ball Movement ──
  { id: 'OH_HUlnbyQ4', title: 'Seawolves Drill (Off Ball O & D)', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Off-Ball Movement & Cutting', concept: 'Timing & Spacing', startTime: 0, notes: 'Drill teaching off-ball offensive movement and defensive positioning simultaneously.' },
  { id: 'I5OTTccXYXY', title: 'Off-Ball Movement Tips', channel: 'First Class Lax', category: 'boys_offense', subcategory: 'Off-Ball Movement & Cutting', concept: 'V-Cuts', startTime: 0, notes: 'Three tips for reading defenses and moving without the ball to create scoring opportunities.' },

  // ── BOYS OFFENSE: Clearing ──
  { id: 'RnYRtSWkBug', title: '2-3-2 Clear', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Clearing', concept: 'Settled Clears', startTime: 0, notes: '2-3-2 clearing formation with spacing and passing options to beat a ride.' },
  { id: 'sX7_dwPEUHs', title: '4-3 Clear', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Clearing', concept: 'Settled Clears', startTime: 0, notes: '4-3 clearing formation overloading one side to create passing lanes.' },
  { id: '4LOocXTxHNw', title: '4-3 Alpha Clear', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Clearing', concept: 'Press Break Clears', startTime: 0, notes: '4-3 clear variation with a specific Alpha call triggering preset rotations.' },
  { id: 'oI9-zj4tdeo', title: 'Clear Pass Terminology', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Clearing', concept: 'Settled Clears', startTime: 0, notes: 'Language and terminology players need for communication during clears.' },

  // ── BOYS EMO ──
  { id: 'HwZ3IUpPbz8', title: 'Cheddar/Pepper Jack Man Up', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Extra Man Offense (EMO)', concept: '3-3 EMO Set', startTime: 0, notes: 'Two man-up plays with specific rotations and shooting options.' },
  { id: 'qLht8H1LofY', title: '22 Quick Man Up', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Extra Man Offense (EMO)', concept: 'Quick Shot Opportunities', startTime: 0, notes: 'Quick-hitting man-up play for an immediate shot opportunity off the set.' },
  { id: '0A6U07_WC8E', title: '3-3 Four Man Wheel Man Up', channel: 'POWLAX', category: 'boys_offense', subcategory: 'Extra Man Offense (EMO)', concept: 'Ball Rotation Patterns', startTime: 0, notes: '3-3 man-up with a four-man wheel rotation creating mismatches.' },

  // ── BOYS FACEOFFS ──
  { id: 'YfAveIh47Pc', title: 'Faceoff Plays and Tactics', channel: 'POWLAX', category: 'boys_faceoffs', subcategory: 'Face-Off Technique', concept: 'Wing Play & Ground Ball Situations', startTime: 0, notes: 'Faceoff wing play, set plays off the draw, and tactical approaches.' },

  // ── BOYS TEAM CONCEPTS ──
  { id: '-xpNBfHYKqA', title: 'Running the Box (Substitutions)', channel: 'POWLAX', category: 'boys_team', subcategory: 'Game Management', concept: 'Substitution Patterns / On-the-Fly Subs', startTime: 0, notes: 'Managing substitution patterns and running an efficient box during live play.' },
  { id: 'c3cfEOWJt70', title: 'Subbing Through the Midline', channel: 'POWLAX', category: 'boys_team', subcategory: 'Game Management', concept: 'Substitution Patterns / On-the-Fly Subs', startTime: 0, notes: 'How to substitute through the midline for a personnel advantage.' },

  // ── BOYS FUNDAMENTALS ──
  { id: 'HadmDjVY6wM', title: '8 Types of Passes', channel: 'Lacrosse Tutorial', category: 'boys_fundamentals', subcategory: 'Stick Skills', concept: 'Passing (Overhand, Sidearm)', startTime: 0, notes: 'Covers 8 essential pass types: overhand, sidearm, BTB, shovel, quick-stick, skip, feed, one-handed.' },
  { id: '8krXEvMftvE', title: '5-Minute Wall Ball Routine', channel: 'POWLAX', category: 'boys_fundamentals', subcategory: 'Stick Skills', concept: 'Stick Protection', startTime: 0, notes: 'Guided 5-minute wall ball covering collarbone catches, one-hand, cross-body, and BTB.' },
  { id: 'hMavv0xBSAE', title: '10-Minute Intermediate Wall Ball', channel: 'POWLAX', category: 'boys_fundamentals', subcategory: 'Stick Skills', concept: 'Weak Hand Development', startTime: 0, notes: 'Follow-along 10-minute intermediate wall ball with quick sticks, Canadian passes, 180 turns.' },
  { id: 'quo6j9UQ9BE', title: 'Ground Balls to Give and Go', channel: 'POWLAX', category: 'boys_fundamentals', subcategory: 'Stick Skills', concept: 'Ground Balls', startTime: 0, notes: 'Proper ground ball pickup with immediate give-and-go transition to offense.' },
  { id: 'o8XhUrZaC88', title: 'D1 Shooting Drills & Technique', channel: 'First Class Lax', category: 'boys_fundamentals', subcategory: 'Stick Skills', concept: 'Cradling', startTime: 0, notes: 'Five D1 attackers demonstrate go-to shooting drills: three-pot, drift, up-the-hash, layup, wing dodge.' },
  { id: 'e0HXUtRWEoo', title: 'Accuracy Shooting with Stanwick Brothers', channel: 'TLN', category: 'boys_fundamentals', subcategory: 'Stick Skills', concept: 'Catching (Stationary, On the Move)', startTime: 0, notes: 'Stanwick brothers demonstrate accuracy drills focused on placing shots to specific corners.' },

  // ── BOYS GOALIE ──
  { id: 'AJMN_44lpio', title: 'Goalie Positioning Fundamentals', channel: 'Goalie Strength', category: 'boys_goalie', subcategory: 'Goalie Skills', concept: 'Positioning & Arc Play', startTime: 0, notes: 'Three pillars of goalie positioning: angle, squareness, and depth.' },

  // ── GIRLS DRAWS ──
  { id: 'u9eYaW06iv0', title: 'How to Win Draw Controls', channel: 'Notre Dame', category: 'girls_draws', subcategory: 'Draw Technique', concept: 'Draw Technique', startTime: 0, notes: 'Notre Dame\'s 3-step process: read ball placement, turn wrists fast, track and chase.' },

  // ── GIRLS DEFENSE ──
  { id: 'ko6QbOcpbmw', title: 'Train Like a College Women\'s Defender', channel: 'College Program', category: 'girls_defense', subcategory: 'Individual Defense', concept: 'Positioning & Footwork', startTime: 0, notes: 'College-level women\'s defensive training: on-ball positioning, channeling, footwork.' },
];

// ============= GAME ARCHIVE DATA =============
// Seeded with sample games — live data comes from Google Sheet
const GAME_ARCHIVE = [
  {
    id: 'duke-cuse-2025',
    title: 'Duke vs Syracuse',
    date: '2025 NCAA Semifinal',
    program: 'boys',
    concepts: ['Split Dodge', 'Fast Breaks (4v3, 3v2)', 'Adjacent Slides'],
    clips: 8,
    summary: 'Elite attacking from both teams. Duke\'s split dodge execution and Syracuse\'s riding pressure.'
  },
  {
    id: 'uva-umd-2025',
    title: 'Virginia vs Maryland',
    date: '2025 ACC Championship',
    program: 'boys',
    concepts: ['Backdoor Cuts', 'Zone Defense', '10-Man Ride'],
    clips: 6,
    summary: 'High-level settled offense vs defensive rotation. Strong midfield transition game.'
  },
  {
    id: 'cornell-umd-2025',
    title: 'Cornell vs Maryland',
    date: '2025 NCAA Men\'s Lacrosse',
    program: 'boys',
    concepts: ['Motion Offense', 'Fast Breaks (4v3, 3v2)', 'Adjacent Slides', 'Settled Clears'],
    clips: 12,
    summary: 'Full-game breakdown with timestamped clips. Cornell\'s motion offense and Maryland\'s transition attack.',
    videoId: 'l0cJ-2UmGlI'
  },
  {
    id: 'bc-nu-2025',
    title: 'Boston College vs Northwestern',
    date: '2025 NCAA Final',
    program: 'girls',
    concepts: ['Behind-the-Cage Offense', 'Free Position Shots', 'Draw Controls'],
    clips: 7,
    summary: 'Explosive fast break lacrosse. BC\'s free position shooting accuracy and NU\'s draw control dominance.'
  },
  {
    id: 'unc-cuse-2025',
    title: 'North Carolina vs Syracuse',
    date: '2025 ACC Semifinal',
    program: 'girls',
    concepts: ['Fast Breaks', 'Free Position Shots', 'Team Defense'],
    clips: 5,
    summary: 'High-paced game. NC\'s transition offense and Syracuse\'s defensive communication.'
  }
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
  const content = programContent ? programContent[conceptName] : null;

  // Auto-attach matching videos from VIDEO_LIBRARY
  if (typeof VIDEO_LIBRARY !== 'undefined') {
    const prefix = program === 'boys' ? 'boys_' : 'girls_';
    const matchingVideos = VIDEO_LIBRARY.filter(v => {
      if (!v.category.startsWith(prefix)) return false;
      const conceptLower = conceptName.toLowerCase();
      return (v.concept && v.concept.toLowerCase().includes(conceptLower)) ||
             (v.subcategory && v.subcategory.toLowerCase().includes(conceptLower)) ||
             (v.title && v.title.toLowerCase().includes(conceptLower)) ||
             (conceptLower.includes(v.concept.toLowerCase()));
    });
    if (matchingVideos.length > 0) {
      if (content) {
        content.videos = matchingVideos.map(v => ({ id: v.id, title: v.title, notes: v.notes, startTime: v.startTime }));
      } else {
        // Create basic content with videos even if no teaching content exists
        return { videos: matchingVideos.map(v => ({ id: v.id, title: v.title, notes: v.notes, startTime: v.startTime })) };
      }
    }
  }
  return content;
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
    const url = `${BTB_CONFIG.webhookUrl}?json=${encodeURIComponent(JSON.stringify({
      api_key: BTB_CONFIG.apiKey,
      action: 'list_events'
    }))}`;
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
    const url = `${BTB_CONFIG.webhookUrl}?action=read&program=${program}&key=${BTB_CONFIG.apiKey}`;
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

function createVideoCard(videoId, title, notes, startTime = 0) {
  return `
    <div class="video-card">
      <div class="video-container">
        ${videoId ? createYouTubeEmbed(videoId, startTime) : '<div class="video-placeholder">Video Coming Soon</div>'}
      </div>
      <div class="coaching-notes">
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
    getConceptContent, countConcepts, fetchSheetData,
    createYouTubeEmbed, createVideoCard
  };
}
