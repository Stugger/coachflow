-- Columns in each seed row:
-- name, details, thumbnail_url, difficulty, equipment, primary_muscles,
-- secondary_muscles, tags, default_tracking_fields

WITH seed (
           name,
           details,
           thumbnail_url,
           demo_video_url,
           difficulty,
           equipment,
           primary_muscles,
           secondary_muscles,
           tags,
           default_tracking_fields
    ) AS (
    VALUES

        -- -----------------------------------------------------------------------------------------------------------------
        -- Compound / Primary Lifts
        -- -----------------------------------------------------------------------------------------------------------------

        (
            'Barbell Back Squat',
            'Set the bar across the upper back, brace, sit between the hips, and drive through the mid-foot to stand.',
            'https://images.pexels.com/photos/17840/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/Dy28eq2PjcM?si=YkkIjMj2F7oWHEZw',
            'INTERMEDIATE',
            ARRAY['BARBELL']::text[],
            ARRAY['QUADS', 'GLUTES']::text[],
            ARRAY['HAMSTRINGS', 'LOWER_BACK', 'CALVES']::text[],
            ARRAY['STRENGTH', 'POWER', 'PUSH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Barbell Bench Press',
            'Set the upper back, lower the bar to the chest with control, then press while keeping the shoulders stable.',
            'https://images.pexels.com/photos/3837743/pexels-photo-3837743.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/gRVjAtPip0Y?si=hjzvmt-Vg_W8Y5sV',
            'INTERMEDIATE',
            ARRAY['BARBELL', 'BENCH']::text[],
            ARRAY['CHEST']::text[],
            ARRAY['FRONT_DELTS', 'TRICEPS']::text[],
            ARRAY['STRENGTH', 'PUSH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Barbell Deadlift',
            'Brace before lifting, keep the bar close to the body, and stand by driving the floor away.',
            'media/system/exercises/barbell-deadlift.webp',
            'https://youtu.be/-4qRntuXBSc?si=dM1bIxVzSrNOgcKA',
            'INTERMEDIATE',
            ARRAY['BARBELL']::text[],
            ARRAY['GLUTES', 'HAMSTRINGS']::text[],
            ARRAY['LOWER_BACK', 'QUADS', 'TRAPS', 'FOREARMS']::text[],
            ARRAY['STRENGTH', 'POWER', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Dumbbell Bench Press',
            'Keep the shoulders set on the bench, lower the dumbbells with control, and press evenly through both arms.',
            'https://images.pexels.com/photos/7289250/pexels-photo-7289250.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/M0tN99QgPyU?si=9Vxf-UpFBcWp9BF-',
            'BEGINNER',
            ARRAY['DUMBBELL', 'BENCH']::text[],
            ARRAY['CHEST']::text[],
            ARRAY['FRONT_DELTS', 'TRICEPS']::text[],
            ARRAY['STRENGTH', 'PUSH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Incline Dumbbell Bench Press',
            'Use a moderate incline, keep the shoulders packed, and press the dumbbells over the upper chest.',
            'https://images.pexels.com/photos/29526383/pexels-photo-29526383.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/gl8H4QLXKTo?si=XQ9YztJZu3hwrDNx',
            'INTERMEDIATE',
            ARRAY['DUMBBELL', 'BENCH']::text[],
            ARRAY['UPPER_CHEST']::text[],
            ARRAY['FRONT_DELTS', 'TRICEPS']::text[],
            ARRAY['STRENGTH', 'PUSH', 'INCLINE']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Dumbbell Romanian Deadlift',
            'Hinge at the hips with soft knees, keep the dumbbells close to the legs, and feel the hamstrings lengthen.',
            'https://images.pexels.com/photos/29825217/pexels-photo-29825217.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/hQgFixeXdZo?si=bhSvX3fRypq0Vunt',
            'INTERMEDIATE',
            ARRAY['DUMBBELL']::text[],
            ARRAY['HAMSTRINGS', 'GLUTES']::text[],
            ARRAY['LOWER_BACK', 'FOREARMS']::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Landmine Shoulder Press',
            'Press the bar up and forward from shoulder height while keeping the ribs down and core braced.',
            'https://images.pexels.com/photos/32521594/pexels-photo-32521594.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/qFXojXa-RCU?si=23Yc1Wqg6hsu7I6c',
            'INTERMEDIATE',
            ARRAY['LANDMINE']::text[],
            ARRAY['FRONT_DELTS']::text[],
            ARRAY['TRICEPS', 'UPPER_CHEST']::text[],
            ARRAY['STRENGTH', 'PUSH', 'OVERHEAD']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Weighted Pull Up',
            'Start from a stable hang with a weight-loaded dip belt around your waist, pull the chest toward the bar, and lower under control without swinging.',
            'https://images.pexels.com/photos/13159257/pexels-photo-13159257.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/HFzrFHqszQM?si=I7M4wOvDSOefU6dx',
            'ADVANCED',
            ARRAY['PULL_UP_BAR', 'DIP_BELT']::text[],
            ARRAY['LATS']::text[],
            ARRAY['BICEPS', 'FOREARMS', 'CORE']::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Trap Bar Squat',
            'Brace the torso, sit between the hips, keep the handles close, and drive through the whole foot.',
            'https://images.pexels.com/photos/32830369/pexels-photo-32830369.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/M-3wmzwsUxc?si=-jI_YEa_ixdLaiq9',
            'INTERMEDIATE',
            ARRAY['TRAP_BAR']::text[],
            ARRAY['QUADS', 'GLUTES']::text[],
            ARRAY['HAMSTRINGS', 'LOWER_BACK', 'CALVES']::text[],
            ARRAY['STRENGTH', 'POWER', 'PUSH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),

        -- -----------------------------------------------------------------------------------------------------------------
        -- Machines
        -- -----------------------------------------------------------------------------------------------------------------

        (
            'Leg Press',
            'Keep the feet planted, lower with control while maintaining hip position, then press through the full foot.',
            'https://images.pexels.com/photos/3076512/pexels-photo-3076512.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['MACHINE']::text[],
            ARRAY['QUADS', 'GLUTES']::text[],
            ARRAY['HAMSTRINGS', 'CALVES']::text[],
            ARRAY['STRENGTH', 'PUSH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Hack Squat',
            'Keep the back supported, lower under control, and drive through the feet without locking the knees hard.',
            'https://images.pexels.com/photos/11191169/pexels-photo-11191169.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'INTERMEDIATE',
            ARRAY['MACHINE']::text[],
            ARRAY['QUADS', 'GLUTES']::text[],
            ARRAY['HAMSTRINGS', 'CALVES']::text[],
            ARRAY['STRENGTH', 'PUSH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Leg Curl',
            'Keep the hips stable against the pad, curl through the hamstrings, and return slowly.',
            'https://images.pexels.com/photos/13965338/pexels-photo-13965338.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/vl5nUdE9mWM?si=ebT9XpsPDjmtfkJD',
            'BEGINNER',
            ARRAY['MACHINE']::text[],
            ARRAY['HAMSTRINGS']::text[],
            ARRAY['CALVES']::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Leg Extension',
            'Keep the hips down, extend the knees under control, pause briefly, and lower slowly.',
            'https://images.pexels.com/photos/19722966/pexels-photo-19722966.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/vl5nUdE9mWM?si=ebT9XpsPDjmtfkJD',
            'BEGINNER',
            ARRAY['MACHINE']::text[],
            ARRAY['QUADS']::text[],
            ARRAY[]::text[],
            ARRAY['STRENGTH', 'PUSH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Hip Abductor Machine',
            'Sit tall, press the knees outward with control, and avoid using momentum.',
            NULL,
            NULL,
            'BEGINNER',
            ARRAY['MACHINE']::text[],
            ARRAY['ABDUCTORS', 'GLUTES']::text[],
            ARRAY[]::text[],
            ARRAY['STRENGTH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Hip Adductor Machine',
            'Sit tall, bring the pads inward with control, and return slowly without bouncing.',
            NULL,
            NULL,
            'BEGINNER',
            ARRAY['MACHINE']::text[],
            ARRAY['ADDUCTORS']::text[],
            ARRAY[]::text[],
            ARRAY['STRENGTH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Hip Thrust Machine',
            'Brace through the torso, drive the hips upward, and squeeze the glutes at full extension.',
            'https://images.pexels.com/photos/31028213/pexels-photo-31028213.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/tztHvSLdXLA?si=8lRCIY-ZWdf7LCxe',
            'BEGINNER',
            ARRAY['MACHINE']::text[],
            ARRAY['GLUTES']::text[],
            ARRAY['HAMSTRINGS', 'CORE']::text[],
            ARRAY['STRENGTH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Seated Calf Raise',
            'Keep the balls of the feet on the platform, lower into a stretch, then rise through the calves.',
            'https://images.pexels.com/photos/13965339/pexels-photo-13965339.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['MACHINE']::text[],
            ARRAY['CALVES']::text[],
            ARRAY[]::text[],
            ARRAY['STRENGTH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Glute Ham Raise',
            'Keep the hips supported, lower under control, and use the hamstrings and glutes to return upright.',
            NULL,
            NULL,
            'ADVANCED',
            ARRAY['MACHINE']::text[],
            ARRAY['HAMSTRINGS', 'GLUTES']::text[],
            ARRAY['CALVES', 'LOWER_BACK']::text[],
            ARRAY['STRENGTH']::text[],
            ARRAY['reps']::text[]
        ),

        -- -----------------------------------------------------------------------------------------------------------------
        -- Arms / Back
        -- -----------------------------------------------------------------------------------------------------------------

        (
            'Dumbbell Curl',
            'Keep the upper arms still, curl without swinging, and lower the dumbbells under control.',
            'https://images.pexels.com/photos/8033046/pexels-photo-8033046.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['DUMBBELL']::text[],
            ARRAY['BICEPS']::text[],
            ARRAY['FOREARMS']::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Dumbbell Hammer Curl',
            'Use a neutral grip, keep the elbows close to the sides, and control the lowering phase.',
            'https://images.pexels.com/photos/31918834/pexels-photo-31918834.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['DUMBBELL']::text[],
            ARRAY['BICEPS', 'FOREARMS']::text[],
            ARRAY[]::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Cable Curl',
            'Keep the elbows fixed near the torso, curl through the biceps, and resist the cable on the way down.',
            'https://images.pexels.com/photos/29850900/pexels-photo-29850900.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['CABLE']::text[],
            ARRAY['BICEPS']::text[],
            ARRAY['FOREARMS']::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Cable Hammer Curl',
            'Use a rope or neutral handles, keep the elbows still, and curl with control.',
            'https://images.pexels.com/photos/13642719/pexels-photo-13642719.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['CABLE']::text[],
            ARRAY['BICEPS', 'FOREARMS']::text[],
            ARRAY[]::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Preacher Curl',
            'Keep the upper arm supported on the pad, curl smoothly, and avoid snapping the elbow straight.',
            'https://images.pexels.com/photos/17559309/pexels-photo-17559309.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['BENCH']::text[],
            ARRAY['BICEPS']::text[],
            ARRAY['FOREARMS']::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Cable Triceps Pushdown',
            'Keep the elbows pinned near the torso, press down through the triceps, and return under control.',
            'https://images.pexels.com/photos/17626054/pexels-photo-17626054.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['CABLE']::text[],
            ARRAY['TRICEPS']::text[],
            ARRAY[]::text[],
            ARRAY['STRENGTH', 'PUSH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Overhead Cable Triceps Extension',
            'Keep the elbows pointed forward, extend overhead through the triceps, and avoid flaring the ribs.',
            'media/system/exercises/cable-tricep-overhead-extension.webp',
            NULL,
            'INTERMEDIATE',
            ARRAY['CABLE']::text[],
            ARRAY['TRICEPS']::text[],
            ARRAY[]::text[],
            ARRAY['STRENGTH', 'PUSH', 'OVERHEAD']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Dumbbell Overhead Triceps Extension',
            'Keep the elbows close, lower the dumbbell behind the head with control, then extend overhead.',
            'media/system/exercises/dumbbell-tricep-overhead-extension.webp',
            NULL,
            'INTERMEDIATE',
            ARRAY['DUMBBELL']::text[],
            ARRAY['TRICEPS']::text[],
            ARRAY[]::text[],
            ARRAY['STRENGTH', 'PUSH', 'OVERHEAD']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Cable Face Pull',
            'Pull the rope toward the face with elbows high, then squeeze the upper back and rear delts.',
            'https://images.pexels.com/photos/33185466/pexels-photo-33185466.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['CABLE']::text[],
            ARRAY['REAR_DELTS', 'TRAPS']::text[],
            ARRAY['SHOULDERS']::text[],
            ARRAY['STRENGTH', 'PULL', 'STABILITY']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Seated Cable Row',
            'Sit tall, pull the handle toward the lower ribs, and squeeze the shoulder blades without leaning back.',
            'https://images.pexels.com/photos/11876626/pexels-photo-11876626.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/tztHvSLdXLA?si=8lRCIY-ZWdf7LCxe',
            'BEGINNER',
            ARRAY['CABLE']::text[],
            ARRAY['LATS']::text[],
            ARRAY['BICEPS', 'TRAPS', 'REAR_DELTS']::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Barbell Bent Over Row',
            'Hinge into a stable torso position, row the bar toward the lower ribs, and avoid jerking the weight.',
            'https://images.pexels.com/photos/3025027/pexels-photo-3025027.png?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/FWJR5Ve8bnQ?si=B3gSFj4hQn0hkUtQ',
            'INTERMEDIATE',
            ARRAY['BARBELL']::text[],
            ARRAY['LATS']::text[],
            ARRAY['TRAPS', 'REAR_DELTS', 'BICEPS', 'LOWER_BACK']::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Single-Arm Dumbbell Row',
            'Brace on a bench or stable surface, pull the dumbbell toward the hip, and lower with control.',
            'https://images.pexels.com/photos/5327476/pexels-photo-5327476.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['DUMBBELL', 'BENCH']::text[],
            ARRAY['LATS']::text[],
            ARRAY['BICEPS', 'TRAPS', 'REAR_DELTS', 'FOREARMS']::text[],
            ARRAY['STRENGTH', 'PULL', 'SINGLE_ARM']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Lat Pulldown',
            'Keep the chest tall, pull the bar toward the upper chest, and avoid leaning excessively backward.',
            'https://images.pexels.com/photos/29218860/pexels-photo-29218860.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/tztHvSLdXLA?si=8lRCIY-ZWdf7LCxe',
            'BEGINNER',
            ARRAY['CABLE']::text[],
            ARRAY['LATS']::text[],
            ARRAY['BICEPS', 'TRAPS', 'REAR_DELTS']::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),

        -- -----------------------------------------------------------------------------------------------------------------
        -- Legs / Carries / Traps
        -- -----------------------------------------------------------------------------------------------------------------

        (
            'Smith Machine Standing Calf Raise',
            'Stand tall under the bar, lower into a controlled calf stretch, then rise through the balls of the feet.',
            'https://images.pexels.com/photos/13965339/pexels-photo-13965339.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['SMITH_MACHINE', 'PLATFORM']::text[],
            ARRAY['CALVES']::text[],
            ARRAY[]::text[],
            ARRAY['STRENGTH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Smith Machine Split Squat',
            'Use a staggered stance, lower straight down with control, and drive through the front foot to stand.',
            NULL,
            NULL,
            'INTERMEDIATE',
            ARRAY['SMITH_MACHINE']::text[],
            ARRAY['QUADS', 'GLUTES']::text[],
            ARRAY['HAMSTRINGS', 'CALVES']::text[],
            ARRAY['STRENGTH', 'SINGLE_LEG']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Goblet Squat',
            'Hold a dumbbell or kettlebell at chest height, sit between the hips, and drive through the full foot to stand.',
            'https://images.pexels.com/photos/36990296/pexels-photo-36990296.png?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['DUMBBELL', 'KETTLEBELL']::text[],
            ARRAY['QUADS', 'GLUTES']::text[],
            ARRAY['HAMSTRINGS', 'CALVES', 'CORE']::text[],
            ARRAY['STRENGTH', 'PUSH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Bulgarian Split Squat',
            'Elevate the rear foot, lower with control, and drive through the front foot to return to standing.',
            'https://images.pexels.com/photos/14673249/pexels-photo-14673249.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'INTERMEDIATE',
            ARRAY['DUMBBELL', 'BENCH']::text[],
            ARRAY['QUADS', 'GLUTES']::text[],
            ARRAY['HAMSTRINGS', 'CALVES', 'CORE']::text[],
            ARRAY['STRENGTH', 'SINGLE_LEG']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Bodyweight Squat',
            'Stand with feet comfortably apart, lower under control, and drive through the full foot to stand.',
            'https://images.pexels.com/photos/8402239/pexels-photo-8402239.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY[]::text[],
            ARRAY['QUADS', 'GLUTES']::text[],
            ARRAY['HAMSTRINGS', 'CALVES']::text[],
            ARRAY['STRENGTH', 'PUSH']::text[],
            ARRAY['reps']::text[]
        ),
        (
            'Bodyweight Lunge',
            'Step into a stable split stance, lower under control, and push through the front foot to return.',
            'https://images.pexels.com/photos/15491995/pexels-photo-15491995.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY[]::text[],
            ARRAY['QUADS', 'GLUTES']::text[],
            ARRAY['HAMSTRINGS', 'CALVES']::text[],
            ARRAY['STRENGTH', 'SINGLE_LEG']::text[],
            ARRAY['reps']::text[]
        ),
        (
            'Weighted Lunge',
            'Hold the load securely, lower into a controlled lunge, and drive through the front foot to return.',
            'https://images.pexels.com/photos/11191178/pexels-photo-11191178.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'INTERMEDIATE',
            ARRAY['DUMBBELL', 'KETTLEBELL']::text[],
            ARRAY['QUADS', 'GLUTES']::text[],
            ARRAY['HAMSTRINGS', 'CALVES', 'CORE']::text[],
            ARRAY['STRENGTH', 'SINGLE_LEG']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Box Jump',
            'Jump onto a stable box, land softly with the knees tracking over the toes, then step down before the next rep.',
            'https://images.pexels.com/photos/7675416/pexels-photo-7675416.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'INTERMEDIATE',
            ARRAY['BOX']::text[],
            ARRAY['QUADS', 'GLUTES']::text[],
            ARRAY['HAMSTRINGS', 'CALVES', 'CORE']::text[],
            ARRAY['POWER', 'PLYOMETRIC', 'CONDITIONING']::text[],
            ARRAY['reps', 'height']::text[]
        ),
        (
            'Farmer''s Carry',
            'Carry the weights with a tall posture, braced core, level shoulders, and controlled steps.',
            'https://images.pexels.com/photos/5837275/pexels-photo-5837275.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['DUMBBELL', 'KETTLEBELL']::text[],
            ARRAY['FOREARMS', 'TRAPS']::text[],
            ARRAY['CORE', 'GLUTES', 'CALVES']::text[],
            ARRAY['STRENGTH', 'CONDITIONING']::text[],
            ARRAY['distance', 'weight']::text[]
        ),
        (
            'Trap Bar Shrug',
            'Stand tall with the handles at the sides, elevate the shoulders straight up, and lower slowly.',
            NULL,
            NULL,
            'BEGINNER',
            ARRAY['TRAP_BAR']::text[],
            ARRAY['TRAPS']::text[],
            ARRAY['FOREARMS']::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Kettlebell Shrug',
            'Hold the kettlebells at the sides, elevate the shoulders without rolling them, then lower with control.',
            NULL,
            NULL,
            'BEGINNER',
            ARRAY['KETTLEBELL']::text[],
            ARRAY['TRAPS']::text[],
            ARRAY['FOREARMS']::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),

        -- -----------------------------------------------------------------------------------------------------------------
        -- Shoulders / Chest
        -- -----------------------------------------------------------------------------------------------------------------

        (
            'Dumbbell Shoulder Press',
            'Brace the core, press overhead without leaning back, and lower the dumbbells under control.',
            'https://images.pexels.com/photos/29865137/pexels-photo-29865137.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'INTERMEDIATE',
            ARRAY['DUMBBELL']::text[],
            ARRAY['FRONT_DELTS']::text[],
            ARRAY['TRICEPS']::text[],
            ARRAY['STRENGTH', 'PUSH', 'OVERHEAD']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Barbell Overhead Press',
            'Keep the glutes and core tight, press the bar overhead, and finish with the head through the arms.',
            'https://images.pexels.com/photos/4720785/pexels-photo-4720785.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/F3QY5vMz_6I?si=uFxUvkoV6EpbZvNg',
            'INTERMEDIATE',
            ARRAY['BARBELL']::text[],
            ARRAY['FRONT_DELTS']::text[],
            ARRAY['TRICEPS', 'CORE']::text[],
            ARRAY['STRENGTH', 'PUSH', 'OVERHEAD']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Cable Chest Fly',
            'Maintain a slight elbow bend, bring the handles together through the chest, and control the stretch.',
            'https://images.pexels.com/photos/30672395/pexels-photo-30672395.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['CABLE']::text[],
            ARRAY['CHEST']::text[],
            ARRAY['FRONT_DELTS']::text[],
            ARRAY['STRENGTH', 'PUSH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Cable Rear Delt Fly',
            'Keep the arms soft, pull the handles apart through the rear delts, and avoid shrugging the shoulders.',
            'media/system/exercises/cable-rear-delt-fly.webp',
            NULL,
            'BEGINNER',
            ARRAY['CABLE']::text[],
            ARRAY['REAR_DELTS']::text[],
            ARRAY['TRAPS']::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Dumbbell Lateral Raise',
            'Raise the dumbbells out to the sides with soft elbows and avoid using momentum through the torso.',
            'https://images.pexels.com/photos/3839506/pexels-photo-3839506.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['DUMBBELL']::text[],
            ARRAY['SIDE_DELTS']::text[],
            ARRAY['TRAPS']::text[],
            ARRAY['STRENGTH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Dumbbell Front Raise',
            'Raise the dumbbells in front with a controlled motion and avoid swinging through the lower back.',
            'https://images.pexels.com/photos/29793977/pexels-photo-29793977.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['DUMBBELL']::text[],
            ARRAY['FRONT_DELTS']::text[],
            ARRAY['SHOULDERS']::text[],
            ARRAY['STRENGTH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Cable Lateral Raise',
            'Keep a slight elbow bend, raise the handle out to the side, and keep tension through the full range.',
            'https://images.pexels.com/photos/11121628/pexels-photo-11121628.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['CABLE']::text[],
            ARRAY['SIDE_DELTS']::text[],
            ARRAY['TRAPS']::text[],
            ARRAY['STRENGTH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Cable Front Raise',
            'Raise the handle in front with control, keep the ribs down, and avoid swinging through the torso.',
            NULL,
            NULL,
            'BEGINNER',
            ARRAY['CABLE']::text[],
            ARRAY['FRONT_DELTS']::text[],
            ARRAY['SHOULDERS']::text[],
            ARRAY['STRENGTH']::text[],
            ARRAY['reps', 'weight']::text[]
        ),

        -- -----------------------------------------------------------------------------------------------------------------
        -- Bodyweight / Warmup / Mobility
        -- -----------------------------------------------------------------------------------------------------------------

        (
            'Arm Circles',
            'Make controlled circles through a comfortable range while keeping the shoulders relaxed.',
            'https://images.pexels.com/photos/8846450/pexels-photo-8846450.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY[]::text[],
            ARRAY['SHOULDERS']::text[],
            ARRAY['FRONT_DELTS', 'SIDE_DELTS', 'REAR_DELTS']::text[],
            ARRAY['WARMUP', 'MOBILITY']::text[],
            ARRAY['reps']::text[]
        ),
        (
            'Cat Cow',
            'Move slowly between spinal flexion and extension while coordinating the motion with steady breathing.',
            'https://images.pexels.com/photos/7663227/pexels-photo-7663227.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['YOGA_MAT']::text[],
            ARRAY['CORE']::text[],
            ARRAY['LOWER_BACK']::text[],
            ARRAY['WARMUP', 'MOBILITY']::text[],
            ARRAY['reps']::text[]
        ),
        (
            'Band Pull Apart',
            'Keep the ribs down, pull the band apart through the upper back, and return with control.',
            'https://images.pexels.com/photos/6339596/pexels-photo-6339596.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['RESISTANCE_BAND']::text[],
            ARRAY['REAR_DELTS', 'TRAPS']::text[],
            ARRAY['SHOULDERS']::text[],
            ARRAY['WARMUP', 'PULL', 'MOBILITY']::text[],
            ARRAY['reps', 'resistance']::text[]
        ),
        (
            'Push Up',
            'Keep a straight body line, lower the chest with control, and press through the hands to return.',
            'https://images.pexels.com/photos/4803738/pexels-photo-4803738.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY[]::text[],
            ARRAY['CHEST']::text[],
            ARRAY['TRICEPS', 'FRONT_DELTS', 'CORE']::text[],
            ARRAY['STRENGTH', 'PUSH']::text[],
            ARRAY['reps']::text[]
        ),
        (
            'Pull Up',
            'Start from a stable hang, pull the chest toward the bar, and lower under control without swinging.',
            'https://images.pexels.com/photos/13159257/pexels-photo-13159257.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            'https://youtu.be/vw5Xmu5CIew?si=uw0IRvW4KSTxfyD2',
            'INTERMEDIATE',
            ARRAY['PULL_UP_BAR']::text[],
            ARRAY['LATS']::text[],
            ARRAY['BICEPS', 'FOREARMS', 'CORE']::text[],
            ARRAY['STRENGTH', 'PULL']::text[],
            ARRAY['reps']::text[]
        ),
        (
            'Plank',
            'Maintain a straight line from shoulders to heels while bracing the core and breathing steadily.',
            'https://images.pexels.com/photos/14623707/pexels-photo-14623707.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY[]::text[],
            ARRAY['CORE']::text[],
            ARRAY['ABS', 'OBLIQUES', 'SHOULDERS']::text[],
            ARRAY['STABILITY']::text[],
            ARRAY['time']::text[]
        ),
        (
            'Side Plank',
            'Stack the shoulders and hips, brace the core, and hold a straight line through the body.',
            'https://images.pexels.com/photos/2294363/pexels-photo-2294363.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'INTERMEDIATE',
            ARRAY[]::text[],
            ARRAY['OBLIQUES']::text[],
            ARRAY['CORE', 'SHOULDERS', 'GLUTES']::text[],
            ARRAY['STABILITY', 'BALANCE']::text[],
            ARRAY['time']::text[]
        ),
        (
            'Child''s Pose',
            'Sit the hips back toward the heels, reach long through the arms, and breathe into a comfortable stretch.',
            'https://images.pexels.com/photos/3822164/pexels-photo-3822164.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['YOGA_MAT']::text[],
            ARRAY['LATS']::text[],
            ARRAY['SHOULDERS', 'LOWER_BACK']::text[],
            ARRAY['STRETCH', 'MOBILITY', 'COOLDOWN']::text[],
            ARRAY['time']::text[]
        ),
        (
            'Standing Forward Fold',
            'Hinge gently at the hips, relax the upper body, and keep the knees softly bent as needed.',
            'https://images.pexels.com/photos/7484897/pexels-photo-7484897.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY[]::text[],
            ARRAY['HAMSTRINGS']::text[],
            ARRAY['CALVES', 'LOWER_BACK']::text[],
            ARRAY['STRETCH', 'MOBILITY', 'COOLDOWN']::text[],
            ARRAY['time']::text[]
        ),
        (
            'Bird Dog',
            'Brace the core, reach the opposite arm and leg long, and keep the hips level throughout the movement.',
            'https://images.pexels.com/photos/6454196/pexels-photo-6454196.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['YOGA_MAT']::text[],
            ARRAY['CORE']::text[],
            ARRAY['GLUTES', 'SHOULDERS', 'LOWER_BACK']::text[],
            ARRAY['WARMUP', 'STABILITY', 'BALANCE']::text[],
            ARRAY['reps']::text[]
        ),
        (
            'Forward Lunge Stretch',
            'Step into a long lunge, tuck the pelvis slightly, and shift forward until the rear hip stretches.',
            'https://images.pexels.com/photos/5331197/pexels-photo-5331197.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY[]::text[],
            ARRAY['HIP_FLEXORS']::text[],
            ARRAY['QUADS', 'GLUTES']::text[],
            ARRAY['STRETCH', 'MOBILITY']::text[],
            ARRAY['time']::text[]
        ),
        (
            'Standing Quad Stretch',
            'Hold the ankle behind the body, keep the knees close together, and maintain a tall posture.',
            'https://images.pexels.com/photos/8084796/pexels-photo-8084796.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY[]::text[],
            ARRAY['QUADS']::text[],
            ARRAY['HIP_FLEXORS']::text[],
            ARRAY['STRETCH', 'MOBILITY']::text[],
            ARRAY['time']::text[]
        ),
        (
            'Wrist Rolls',
            'Make slow circles through a comfortable range in both directions before loading the wrists.',
            'https://images.pexels.com/photos/7298394/pexels-photo-7298394.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY[]::text[],
            ARRAY['FOREARMS']::text[],
            ARRAY[]::text[],
            ARRAY['WARMUP', 'MOBILITY']::text[],
            ARRAY['time']::text[]
        ),
        (
            'Ankle Rolls',
            'Make controlled circles through a comfortable range in both directions before lower-body work.',
            'https://images.pexels.com/photos/9486712/pexels-photo-9486712.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY[]::text[],
            ARRAY['CALVES']::text[],
            ARRAY[]::text[],
            ARRAY['WARMUP', 'MOBILITY']::text[],
            ARRAY['time']::text[]
        ),
        (
            'Cross Body Shoulder Stretch',
            'Draw one arm across the chest, keep the shoulder relaxed, and apply gentle pressure with the other arm.',
            'https://images.pexels.com/photos/7592375/pexels-photo-7592375.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY[]::text[],
            ARRAY['SHOULDERS', 'REAR_DELTS']::text[],
            ARRAY[]::text[],
            ARRAY['STRETCH', 'MOBILITY', 'COOLDOWN']::text[],
            ARRAY['time']::text[]
        ),

    -- -----------------------------------------------------------------------------------------------------------------
    -- Cardio / Conditioning
    -- -----------------------------------------------------------------------------------------------------------------

        (
            'Sled Push',
            'Drive the sled forward with a low body angle, braced core, and short powerful steps.',
            'https://images.pexels.com/photos/36986181/pexels-photo-36986181.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'INTERMEDIATE',
            ARRAY['SLED']::text[],
            ARRAY['QUADS', 'GLUTES']::text[],
            ARRAY['HAMSTRINGS', 'CALVES', 'CORE']::text[],
            ARRAY['STRENGTH', 'CONDITIONING', 'PUSH']::text[],
            ARRAY['distance', 'weight']::text[]
        ),
        (
            'Treadmill',
            'Walk or run at the prescribed pace while maintaining a controlled stride and upright posture.',
            'https://images.pexels.com/photos/3757957/pexels-photo-3757957.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['TREADMILL']::text[],
            ARRAY['LEGS']::text[],
            ARRAY['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES']::text[],
            ARRAY['CARDIO', 'CONDITIONING']::text[],
            ARRAY['time', 'speed', 'incline']::text[]
        ),
        (
            'Stair Stepper',
            'Step at a controlled pace while maintaining an upright posture and avoiding excessive support on the rails.',
            'https://images.pexels.com/photos/31012859/pexels-photo-31012859.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['STAIR_STEPPER']::text[],
            ARRAY['QUADS', 'GLUTES']::text[],
            ARRAY['HAMSTRINGS', 'CALVES']::text[],
            ARRAY['CARDIO', 'CONDITIONING']::text[],
            ARRAY['time', 'resistance']::text[]
        ),
        (
            'Rower',
            'Drive through the legs first, then pull through the torso and arms before returning smoothly.',
            'https://images.pexels.com/photos/897061/pexels-photo-897061.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['ROWER']::text[],
            ARRAY['FULL_BODY']::text[],
            ARRAY['LATS', 'QUADS', 'GLUTES', 'HAMSTRINGS', 'CORE', 'BICEPS']::text[],
            ARRAY['CARDIO', 'CONDITIONING', 'PULL']::text[],
            ARRAY['time', 'distance']::text[]
        ),
        (
            'Wall Sit',
            'Slide down a wall until the knees are comfortably bent, keep the back supported, and hold steadily.',
            'https://images.pexels.com/photos/6740055/pexels-photo-6740055.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY[]::text[],
            ARRAY['QUADS']::text[],
            ARRAY['GLUTES', 'CALVES']::text[],
            ARRAY['STRENGTH', 'CONDITIONING']::text[],
            ARRAY['time']::text[]
        ),
        (
            'Medicine Ball Slam',
            'Raise the ball overhead, brace the core, and drive it forcefully into the ground before resetting.',
            'https://images.pexels.com/photos/29205096/pexels-photo-29205096.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'INTERMEDIATE',
            ARRAY['MEDICINE_BALL']::text[],
            ARRAY['FULL_BODY']::text[],
            ARRAY['SHOULDERS', 'CORE', 'LATS', 'GLUTES']::text[],
            ARRAY['POWER', 'CONDITIONING']::text[],
            ARRAY['reps', 'weight']::text[]
        ),
        (
            'Battle Ropes',
            'Keep the knees soft and core braced while creating strong, controlled waves with both arms.',
            'https://images.pexels.com/photos/28080/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['BATTLE_ROPES']::text[],
            ARRAY['SHOULDERS']::text[],
            ARRAY['FOREARMS', 'CORE', 'TRAPS']::text[],
            ARRAY['CARDIO', 'CONDITIONING']::text[],
            ARRAY['time']::text[]
        ),
        (
            'Standing Elliptical',
            'Maintain a steady pace with relaxed shoulders and controlled movement through the full stride.',
            'https://images.pexels.com/photos/7243602/pexels-photo-7243602.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['ELLIPTICAL']::text[],
            ARRAY['LEGS']::text[],
            ARRAY['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES']::text[],
            ARRAY['CARDIO', 'CONDITIONING']::text[],
            ARRAY['time', 'resistance']::text[]
        ),
        (
            'Stationary Bike',
            'Maintain a smooth pedal stroke, steady posture, and the prescribed pace or resistance.',
            'https://images.pexels.com/photos/35567440/pexels-photo-35567440.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
            NULL,
            'BEGINNER',
            ARRAY['BIKE']::text[],
            ARRAY['LEGS']::text[],
            ARRAY['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES']::text[],
            ARRAY['CARDIO', 'CONDITIONING']::text[],
            ARRAY['time', 'resistance']::text[]
        )
)

INSERT INTO exercises (
    trainer_id,
    visibility,
    name,
    details,
    thumbnail_url,
    demo_video_url,
    metadata_json,
    archived
)
SELECT
    NULL,
    'GLOBAL',
    seed.name,
    seed.details,
    seed.thumbnail_url,
    seed.demo_video_url,
    jsonb_build_object(
            'equipment', seed.equipment,
            'primaryMuscles', seed.primary_muscles,
            'secondaryMuscles', seed.secondary_muscles,
            'difficulty', seed.difficulty,
            'tags', seed.tags,
            'defaultTrackingFields', seed.default_tracking_fields
    ),
    FALSE
FROM seed
WHERE NOT EXISTS (
    SELECT 1
    FROM exercises existing
    WHERE existing.visibility = 'GLOBAL'
      AND LOWER(existing.name) = LOWER(seed.name)
);