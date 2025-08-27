class Enemy {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.width = 50; // Hafif daha ince
        this.height = 70; // Yükseklik aynı
        this.maxSpeed = 1.2; // Reduced from 1.8 to 1.2
        this.baseSpeed = 1.2; // Reduced from 1.8 to 1.2
        this.currentSpeed = 1.2; // Reduced from 1.8 to 1.2
        this.acceleration = 0.15; // Reduced from 0.2 to 0.15
        this.jumpPower = 9; // Reduced from 9 to 8
        this.vx = Math.random() > 0.5 ? 1.0 : -1.0;
        this.vy = 0;
        this.game = game;
        this.onGround = false;
        this.active = true;
        
        // Image system for enemy character - only load right image, flip for left
        this.imageRight = new Image();
        this.imagesLoaded = false;
        this.facingRight = this.vx > 0; // Initial facing direction
        
        // Load only right-facing image (will be flipped for left direction)
        this.imageRight.onload = () => {
            this.imagesLoaded = true;
        };
        this.imageRight.src = 'images/enemy_char_right.png';
        this.frozen = false;
        this.frozenTime = 0;
        this.snowHits = 0; // Kar isabet sayısı
        this.maxSnowHits = 3; // Donmak için gereken isabet sayısı
        // frozenTimer removed - no recovery system
        this.isPushed = false;
        this.isRolling = false;
        this.rollSpeed = 0;
        this.jumpCooldown = 0;
        this.directionChangeTimer = 0;
        this.isPreparingToJump = false;
        this.jumpPreparationTime = 0;
        this.targetPlatformX = 0;
        this.justLanded = false;
        this.landingFocusTime = 0;
        // Individual personality traits for more natural behavior
        this.personalityOffset = (Math.random() - 0.5) * 100; // -50 to +50 pixel offset preference
        
        // MUCH MORE AGGRESSIVE - some enemies are 100% focused on player
        const rand = Math.random();
        if (rand < 0.4) {
            // 40% chance: ULTRA AGGRESSIVE - always chase player
            this.aggressiveness = 1.0;
            this.isHunter = true; // Mark as dedicated hunter
            this.color = `hsl(0, 90%, 60%)`; // RED for hunters - more dangerous looking
        } else if (rand < 0.7) {
            // 30% chance: VERY AGGRESSIVE
            this.aggressiveness = 0.8 + Math.random() * 0.2; // 0.8 to 1.0
            this.isHunter = false;
            this.color = `hsl(30, 80%, 55%)`; // ORANGE for aggressive
        } else {
            // 30% chance: NORMAL AGGRESSIVE
            this.aggressiveness = 0.6 + Math.random() * 0.2; // 0.6 to 0.8
            this.isHunter = false;
            this.color = `hsl(${Math.random() * 360}, 70%, 50%)`; // Random color for normal
        }
        
        this.patience = 0.5 + Math.random() * 1.0; // 0.5 to 1.5 - how long they wait before acting
        
        // Natural behavior patterns
        this.explorationMode = false; // When true, enemy explores instead of hunting
        this.explorationTimer = 0;
        this.currentGoal = 'explore'; // 'explore', 'hunt', 'patrol'
        
        // Anger level system
        this.angerSpeedMultiplier = 1.0; // Speed multiplier based on anger level
        this.goalChangeTimer = 3000 + Math.random() * 5000; // 3-8 seconds between goal changes
        this.preferredDirection = Math.random() > 0.5 ? 1 : -1; // Natural movement preference
        
        // Smart pathfinding
        this.currentPlatformLevel = 0; // Track which level enemy is on
        this.targetPlatformLevel = 0; // Which level enemy wants to reach
        
        // Anti-stuck system
        this.lastPosition = { x: this.x, y: this.y };
        this.stuckTimer = 0;
        this.explorationDirection = Math.random() > 0.5 ? 1 : -1; // Random exploration direction
        this.explorationTimer = 0;
        this.pathfindingCooldown = 0; // Prevent too frequent pathfinding calculations
        this.currentRoute = null; // Current pathfinding route
        this.routeStep = 0; // Which step of the route we're on
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // Update goal and behavior timers
        this.goalChangeTimer -= deltaTime;
        this.pathfindingCooldown -= deltaTime;
        
        if (this.goalChangeTimer <= 0) {
            // ANGER-BASED goal selection - higher anger = more hunting
            const angerLevel = this.game.angerLevel || 0;
            const angerBonus = angerLevel / 100; // 0.0 to 1.0 multiplier
            const rand = Math.random();
            
            // MUCH MORE HUNTING - even at 0% anger, favor hunting heavily
            const exploreChance = Math.max(0.02, 0.1 - (angerBonus * 0.08)); // 10% to 2%
            const patrolChance = Math.max(0.05, 0.1 - (angerBonus * 0.05)); // 10% to 5%
            const huntChance = 1 - exploreChance - patrolChance; // Rest goes to hunting (80% to 93%)
            
            if (rand < exploreChance) {
                this.currentGoal = 'explore';
            } else if (rand < exploreChance + patrolChance) {
                this.currentGoal = 'patrol';
            } else {
                this.currentGoal = 'hunt'; // Most likely at high anger
            }
            
            console.log(`🎯 GOAL CHANGE (Anger ${angerLevel}%): ${this.currentGoal} (hunt chance: ${(huntChance*100).toFixed(1)}%)`);
            this.goalChangeTimer = 3000 + Math.random() * 5000; // 3-8 seconds
        }
        
        // Update current platform level
        this.updatePlatformLevel();
        
        // Anti-stuck system - detect if enemy is not moving for too long
        const currentPosition = { x: this.x, y: this.y };
        const distanceMoved = Math.abs(currentPosition.x - this.lastPosition.x) + Math.abs(currentPosition.y - this.lastPosition.y);
        
        if (distanceMoved < 8 && !this.frozen && this.onGround) { // More sensitive stuck detection
            this.stuckTimer += deltaTime;
            
            // Enter exploration mode much faster - no level restrictions
            if (this.stuckTimer > 800) { // Much faster stuck detection (0.8 seconds)
                this.explorationTimer = 4000; // Longer exploration (4 seconds)
                this.explorationDirection = Math.random() > 0.5 ? 1 : -1; // Random direction
                this.stuckTimer = 0; // Reset stuck timer
                
                // Force immediate movement to break stuck state
                this.vx = this.explorationDirection * this.currentSpeed;
                
                // Sometimes jump to change level
                if (Math.random() < 0.3 && this.jumpCooldown <= 0 && this.snowHits === 0) {
                    this.vy = -this.jumpPower;
                    this.onGround = false;
                    this.jumpCooldown = 500;
                }
            }
        } else {
            this.stuckTimer = 0; // Reset if moving
        }
        
        // Update exploration timer
        if (this.explorationTimer > 0) {
            this.explorationTimer -= deltaTime;
        }
        
        this.lastPosition = { ...currentPosition };
        
        // Frozen timer system COMPLETELY REMOVED - no recovery from snow hits
        // Once hit by snow, enemy stays affected until death
        // Only apply gravity to frozen enemies
        if (this.frozen) {
            this.vy += this.game.gravity;
        }
        
        if (this.frozen && this.snowHits >= 3) {
            this.frozenTime -= deltaTime;
            if (this.frozenTime <= 0) {
                // Snowball melts - unfreeze and return to normal
                console.log(`🔥 SNOWBALL MELTED: Unfreezing enemy`);
                this.unfreeze();
                return;
            }
            
            // Apply gravity to frozen enemies (so they fall if in air)
            this.vy += this.game.gravity;
            
            // If rolling, continue rolling and check for collisions
            if (this.isRolling) {
                this.vx = this.rollSpeed;

                // Slow down rolling over time (more friction for faster death)
                this.rollSpeed *= 0.988; // Faster deceleration
                
                // Check if rolling for too long (3 seconds max) or too slow - MUCH MORE AGGRESSIVE
                const rollingTime = Date.now() - (this.rollStartTime || Date.now());
                if (Math.abs(this.rollSpeed) < 1.0 || rollingTime > 3000) { // 3 seconds max rolling, higher speed threshold
                    this.isRolling = false;
                    this.destroy(); // Kar topu kesin ölür - NO RECOVERY
                    
                    // Death particles when rolling stops
                    for (let i = 0; i < 6; i++) {
                        this.game.addParticle(
                            this.x + Math.random() * this.width,
                            this.y + Math.random() * this.height,
                            '#FFFFFF'
                        );
                    }
                    return;
                }
                
                // Apply gravity and update position for rolling snowball
                this.vy += this.game.gravity;
                this.x += this.vx;
                this.y += this.vy;
                
                // Check screen boundaries - destroy if off screen
                if (this.x < -this.width || this.x > 800 + this.width || this.y > 600 + this.height) {
                    this.isRolling = false;
                    this.destroy(); // Kar topu ekran dışına çıktı, ölür
                    return;
                }
                
                // Platform collision for rolling snowball - allow passing through from sides and bottom
                this.onGround = false;
                this.game.platforms.forEach(platform => {
                    // Check if snowball is overlapping with platform
                    const overlapping = this.x < platform.x + platform.width &&
                                       this.x + this.width > platform.x &&
                                       this.y < platform.y + platform.height &&
                                       this.y + this.height > platform.y;
                    
                    if (overlapping) {
                        // Only land on platform if falling down and snowball's bottom was above platform before
                        const snowballBottom = this.y + this.height;
                        const snowballBottomPrevious = snowballBottom - this.vy;
                        
                        if (this.vy > 0 && snowballBottomPrevious <= platform.y + 5) { // 5px tolerance
                            this.y = platform.y - this.height;
                            this.vy = 0;
                            this.onGround = true;
                        }
                        // Bounce off walls (ground platforms only) - improved bouncing
                        else if (platform.type === 'ground' && Math.abs(this.rollSpeed) > 1) {
                            const snowballCenterX = this.x + this.width / 2;
                            const platformCenterX = platform.x + platform.width / 2;
                            
                            if (snowballCenterX < platformCenterX && this.rollSpeed > 0) {
                                // Hit from left - bounce but keep momentum
                                this.x = platform.x - this.width - 2; // Extra spacing to prevent sticking
                                this.rollSpeed = -this.rollSpeed * 0.9; // Less energy loss for longer rolling
                                this.vy = -2; // Add small upward bounce to escape corners
                            } else if (snowballCenterX > platformCenterX && this.rollSpeed < 0) {
                                // Hit from right - bounce but keep momentum
                                this.x = platform.x + platform.width + 2; // Extra spacing to prevent sticking
                                this.rollSpeed = -this.rollSpeed * 0.9; // Less energy loss for longer rolling
                                this.vy = -2; // Add small upward bounce to escape corners
                            }
                        }
                    }
                        });
        
        // Check wall collisions for platforms with walls
        this.game.platforms.forEach(platform => {
            if (platform.walls) {
                this.checkWallCollision(platform);
            }
        });
        
        // Screen boundaries - better bouncing
                if (this.x <= 0) {
                    this.x = 0;
                    this.rollSpeed = Math.abs(this.rollSpeed) * 0.9; // Less energy loss for longer rolling
                } else if (this.x + this.width >= this.game.canvas.width) {
                    this.x = this.game.canvas.width - this.width;
                    this.rollSpeed = -Math.abs(this.rollSpeed) * 0.9; // Less energy loss for longer rolling
                }
                
            } else {
                // If frozen but not rolling, still apply gravity and platform collision
                this.vx = 0;
                
                // Update position (only vertical movement due to gravity)
                this.y += this.vy;
                
                // Platform collision for stationary frozen enemy
                this.onGround = false;
                this.game.platforms.forEach(platform => {
                    const overlapping = this.x < platform.x + platform.width &&
                                       this.x + this.width > platform.x &&
                                       this.y < platform.y + platform.height &&
                                       this.y + this.height > platform.y;
                    
                    if (overlapping) {
                        // Only land on platform if falling down
                        const enemyBottom = this.y + this.height;
                        const enemyBottomPrevious = enemyBottom - this.vy;
                        const enemyTop = this.y;
                        const enemyTopPrevious = enemyTop - this.vy;
                        
                        // Landing on top of platform (falling down)
                        if (this.vy > 0 && enemyBottomPrevious <= platform.y + 5) {
                            this.y = platform.y - this.height;
                            this.vy = 0;
                            this.onGround = true;
                        }
                        // Passing through from bottom (if somehow moving up while frozen)
                        else if (this.vy < 0 && enemyTopPrevious >= platform.y + platform.height - 5) {
                            // Allow passage through platform from below
                        }
                    }
                });
            }
            return;
        }
        
        // Update timers
        this.jumpCooldown -= deltaTime;
        this.directionChangeTimer -= deltaTime;
        this.jumpPreparationTime -= deltaTime;
        this.landingFocusTime -= deltaTime;
        
        // Smart AI - can jump between platforms like player
        const playerX = this.game.player.x + this.game.player.width / 2;
        const playerY = this.game.player.y + this.game.player.height / 2;
        const enemyX = this.x + this.width / 2;
        const enemyY = this.y + this.height / 2;
        
        // Decide movement direction (like player input simulation)
        let wantsToMoveLeft = false;
        let wantsToMoveRight = false;
        
        // If in exploration mode, always override normal behavior (no level restrictions)
        if (this.explorationTimer > 0) {
            if (this.explorationDirection < 0) {
                wantsToMoveLeft = true;
            } else {
                wantsToMoveRight = true;
            }
        } else {
        
        // If just landed, focus on player for a while
        if (this.justLanded && this.landingFocusTime > 0) {
            // Direct movement towards player after landing
            if (playerX < enemyX) {
                wantsToMoveLeft = true;
                wantsToMoveRight = false;
            } else if (playerX > enemyX) {
                wantsToMoveRight = true;
                wantsToMoveLeft = false;
            }
        } else {
            // Reset landing state when focus time is over
            if (this.justLanded && this.landingFocusTime <= 0) {
                this.justLanded = false;
            }
            // Normal random direction changes - always move, never stop
            if (this.directionChangeTimer <= 0) {
                const rand = Math.random();
                if (rand < 0.5) {
                    wantsToMoveLeft = true;
                } else {
                    wantsToMoveRight = true;
                }
                // Always move - no stopping allowed
                this.directionChangeTimer = 2000 + Math.random() * 3000; // 2-5 seconds - faster direction changes
            } else {
                // Continue current direction tendency
                if (this.vx < 0) wantsToMoveLeft = true;
                else if (this.vx > 0) wantsToMoveRight = true;
            }
        }
        
        // Goal-based behavior system
        let shouldHuntPlayer = false;
        
        if (this.currentGoal === 'hunt') {
            // Smart pathfinding when hunting - much more aggressive
            const playerPlatform = this.getPlayerPlatform();
            const enemyPlatform = this.getCurrentPlatform();
            
            // If player is on different platform or significantly higher/lower, use pathfinding
            const verticalDistance = Math.abs(playerY - (this.y + this.height/2));
            const horizontalDistance = Math.abs(playerX - (this.x + this.width/2));
            
            if ((playerPlatform && enemyPlatform && playerPlatform !== enemyPlatform) || 
                verticalDistance > 80 || 
                (verticalDistance > 40 && horizontalDistance > 150)) {
                
                // More natural pathfinding updates
                if (!this.currentRoute || this.pathfindingCooldown <= 0 || 
                    (this.currentRoute && Math.random() < 0.03)) { // 3% chance to recalculate route
                    this.currentRoute = this.findSmartPath(playerX, playerY);
                    this.routeStep = 0;
                    this.pathfindingCooldown = 800; // Slower recalculation for more natural behavior
                }
                
                const path = this.currentRoute;
                if (path) {
                    if (path.action === 'move_to_edge') {
                        // Move towards platform edge to drop down
                        const distanceToTarget = Math.abs(this.x + this.width/2 - path.targetX);
                        if (distanceToTarget > 20) {
                            if (path.direction < 0) {
                                wantsToMoveLeft = true;
                                wantsToMoveRight = false;
                            } else {
                                wantsToMoveRight = true;
                                wantsToMoveLeft = false;
                            }
                        }
                        // Don't hunt directly when pathfinding
                        shouldHuntPlayer = false;
                    } else if (path.action === 'jump_to_platform') {
                        // Move towards jump position (direct jump)
                        const distanceToTarget = Math.abs(this.x + this.width/2 - path.targetX);
                        if (distanceToTarget > 30) {
                            if (path.targetX < this.x + this.width/2) {
                                wantsToMoveLeft = true;
                                wantsToMoveRight = false;
                            } else {
                                wantsToMoveRight = true;
                                wantsToMoveLeft = false;
                            }
                        }
                        // Don't hunt directly when pathfinding
                        shouldHuntPlayer = false;
                    } else if (path.action === 'move_to_intermediate') {
                        // Move to intermediate platform first (indirect route)
                        const distanceToTarget = Math.abs(this.x + this.width/2 - path.targetX);
                        
                        // Check if we've reached the intermediate platform
                        const currentPlatform = this.getCurrentPlatform();
                        if (currentPlatform && path.intermediatePlatform && 
                            Math.abs(currentPlatform.x - path.intermediatePlatform.x) < 20 &&
                            Math.abs(currentPlatform.y - path.intermediatePlatform.y) < 20) {
                            // We've reached intermediate platform, now move toward final target
                            this.currentRoute = {
                                action: 'jump_to_platform',
                                targetX: path.finalTarget.x,
                                targetY: path.finalTarget.y,
                                type: 'final_jump'
                            };
                        } else if (distanceToTarget > 20) {
                            // Still moving to intermediate platform
                            if (path.targetX < this.x + this.width/2) {
                                wantsToMoveLeft = true;
                                wantsToMoveRight = false;
                            } else {
                                wantsToMoveRight = true;
                                wantsToMoveLeft = false;
                            }
                        }
                        // Don't hunt directly when pathfinding
                        shouldHuntPlayer = false;
                    }
                }
            } else {
                // Same level - clear route and use normal hunting behavior
                this.currentRoute = null;
                this.routeStep = 0;
                
                const playerAboveEnemy = playerY < enemyY - 30;
                const playerDistance = Math.abs(playerX - enemyX);
                
                // ANGER-BASED aggressive hunting - higher anger = more focused
                const angerLevel = this.game.angerLevel || 0;
                const angerBonus = angerLevel / 100; // 0.0 to 1.0 multiplier
                
                let baseDecisionChance;
                if (this.isHunter) {
                    // HUNTERS: Always chase player (99% chance + anger bonus)
                    baseDecisionChance = 0.99 + (angerBonus * 0.01); // Up to 100%
                    console.log(`🎯 HUNTER MODE: Always chasing player! (Anger: ${angerLevel}%)`);
                } else {
                    // NORMAL: MUCH MORE AGGRESSIVE - high base chance even at 0% anger
                    baseDecisionChance = 0.6 + (angerBonus * 0.3); // 60% to 90% based on anger
                    if (playerAboveEnemy) baseDecisionChance = Math.max(0.5 + (angerBonus * 0.4), baseDecisionChance * 0.9); // Less penalty at all anger levels
                    if (playerDistance < 300) baseDecisionChance += 0.2 + (angerBonus * 0.2); // Consistent bonus
                    if (playerDistance < 150) baseDecisionChance += 0.2 + (angerBonus * 0.2); // More bonus
                    if (playerDistance < 75) baseDecisionChance = 0.95 + (angerBonus * 0.05); // 95-100% when very close
                    
                    // At 100% anger, FORCE hunting regardless of distance
                    if (angerLevel >= 100) {
                        baseDecisionChance = 0.98; // 98% chance to hunt at max anger
                    }
                }
                
                const personalizedChance = baseDecisionChance * this.aggressiveness;
                shouldHuntPlayer = Math.random() < personalizedChance;
                console.log(`🤔 HUNT DECISION: chance=${personalizedChance.toFixed(2)}, shouldHunt=${shouldHuntPlayer}, distance=${playerDistance.toFixed(1)}`);
            }
        } else if (this.currentGoal === 'patrol') {
            // Patrol mode - move in preferred direction, occasionally check player
            const rand = Math.random();
            const playerDistance = Math.abs(playerX - enemyX);
            const playerAbove = playerY < enemyY - 30;
            
            // ANGER-BASED notice chance - higher anger = more player awareness
            const angerLevel = this.game.angerLevel || 0;
            const angerBonus = angerLevel / 100; // 0.0 to 1.0 multiplier
            
            let noticeChance;
            if (this.isHunter) {
                // HUNTERS: Always notice player (95% + anger bonus)
                noticeChance = 0.95 + (angerBonus * 0.05); // Up to 100%
                console.log(`🎯 HUNTER PATROL: Always looking for player! (Anger: ${angerLevel}%)`);
            } else {
                // NORMAL: MUCH HIGHER notice chance - more player awareness
                noticeChance = 0.4 + (angerBonus * 0.4); // 40% to 80% base chance
                if (playerDistance < 300) noticeChance = 0.6 + (angerBonus * 0.3); // 60% to 90% if close
                if (playerDistance < 150) noticeChance = 0.8 + (angerBonus * 0.15); // 80% to 95% if very close
                if (playerDistance < 75) noticeChance = 0.95 + (angerBonus * 0.05); // 95% to 100% if extremely close
                if (playerAbove && playerDistance < 300) noticeChance = 0.5 + (angerBonus * 0.3); // 50% to 80% if above
                
                // At 100% anger, FORCE noticing player
                if (angerLevel >= 100) {
                    noticeChance = 0.95; // 95% chance to notice at max anger
                }
            }
            
            if (rand < noticeChance) {
                shouldHuntPlayer = true;
                console.log(`👀 PATROL NOTICED PLAYER: chance=${noticeChance.toFixed(2)}, distance=${playerDistance.toFixed(1)}`);
            } else {
                console.log(`😴 PATROL IGNORING PLAYER: chance=${noticeChance.toFixed(2)}, distance=${playerDistance.toFixed(1)}`);
                // Continue patrolling in preferred direction
                if (this.preferredDirection > 0) {
                    wantsToMoveRight = true;
                } else {
                    wantsToMoveLeft = true;
                }
                // Occasionally change preferred direction
                if (Math.random() < 0.002) { // 0.2% chance per frame
                    this.preferredDirection *= -1;
                }
            }
        } else if (this.currentGoal === 'explore') {
            // EXPLORE mode with ANGER-BASED player detection
            const angerLevel = this.game.angerLevel || 0;
            const angerBonus = angerLevel / 100; // 0.0 to 1.0 multiplier
            const playerDistance = Math.abs(playerX - enemyX);
            
            // Even in explore mode, MUCH HIGHER player awareness
            let exploreNoticeChance = 0.15 + (angerBonus * 0.25); // 15% to 40% base chance
            if (playerDistance < 200) exploreNoticeChance += 0.1 + (angerBonus * 0.2); // +10-30% if close
            if (playerDistance < 100) exploreNoticeChance += 0.2 + (angerBonus * 0.3); // +20-50% if very close
            
            // At 100% anger, explorers become hunters temporarily
            if (angerLevel >= 100 && Math.random() < 0.5) {
                shouldHuntPlayer = true;
                console.log(`🔥 EXPLORE -> HUNT: Max anger forces hunting! distance=${playerDistance.toFixed(1)}`);
            } else if (Math.random() < exploreNoticeChance) {
                shouldHuntPlayer = true;
                console.log(`👁️ EXPLORE NOTICED PLAYER: chance=${exploreNoticeChance.toFixed(3)}, anger=${angerLevel}%`);
            }
        }
        
        if (shouldHuntPlayer) { // Goal-based decision making
            console.log(`🎯 HUNTING PLAYER! playerX=${playerX.toFixed(1)}, enemyX=${enemyX.toFixed(1)}, playerY=${playerY.toFixed(1)}, enemyY=${enemyY.toFixed(1)}`);
            const horizontalDistance = Math.abs(playerX - enemyX);
            const verticalDistance = Math.abs(playerY - enemyY);
            
            // PRIORITY 1: If player is BELOW enemy, try to drop down to reach them
            if (playerY > enemyY + 50) {
                const horizontalDist = Math.abs(playerX - enemyX);
                const angerLevel = this.game.angerLevel || 0;
                console.log(`⬇️ PLAYER BELOW: Trying to drop down! playerY=${playerY.toFixed(1)}, enemyY=${enemyY.toFixed(1)}, anger=${angerLevel}%`);
                
                // At high anger, be more aggressive about dropping down
                const dropThreshold = angerLevel >= 80 ? 80 : 30; // Wider drop range at high anger
                
                // Move towards player horizontally first, then drop
                if (horizontalDist > dropThreshold) {
                    if (playerX < enemyX) {
                        wantsToMoveLeft = true;
                        wantsToMoveRight = false;
                        console.log(`⬅️ MOVING LEFT to drop down to player (anger=${angerLevel}%)`);
                    } else if (playerX > enemyX) {
                        wantsToMoveRight = true;
                        wantsToMoveLeft = false;
                        console.log(`➡️ MOVING RIGHT to drop down to player (anger=${angerLevel}%)`);
                    }
                } else {
                    // Close horizontally - FORCE drop down by walking off platform
                    if (playerX < enemyX) {
                        wantsToMoveLeft = true;
                        console.log(`🔥⬇️⬅️ FORCE DROPPING LEFT towards player below (anger=${angerLevel}%)`);
                    } else {
                        wantsToMoveRight = true;
                        console.log(`🔥⬇️➡️ FORCE DROPPING RIGHT towards player below (anger=${angerLevel}%)`);
                    }
                }
            }
            // PRIORITY 2: If player is on same level, move towards them directly
            else if (Math.abs(playerY - enemyY) <= 50) {
                const distanceToPlayer = Math.abs(playerX - enemyX);
                console.log(`🏃 SAME LEVEL HUNT: distance=${distanceToPlayer.toFixed(1)}, playerX=${playerX.toFixed(1)}, enemyX=${enemyX.toFixed(1)}`);
                
                // Only move if not too close (prevents jittering)
                if (distanceToPlayer > 50) {
                    if (playerX < enemyX) {
                        wantsToMoveLeft = true;
                        wantsToMoveRight = false;
                        console.log(`⬅️ HUNTING LEFT towards player`);
                    } else if (playerX > enemyX) {
                        wantsToMoveRight = true;
                        wantsToMoveLeft = false;
                        console.log(`➡️ HUNTING RIGHT towards player`);
                    }
                } else {
                    console.log(`🎯 TOO CLOSE TO PLAYER: Not moving (distance=${distanceToPlayer.toFixed(1)})`);
                }
            }
            // If player is above, use step-by-step climbing strategy
            else if (playerY < enemyY - 50) {
                // Step 1: Check if there's a platform directly above (within jump range)
                let nextLevelPlatform = null;
                let canReachPlayer = false;
                
                // Find platforms directly above current position
                this.game.platforms.forEach(platform => {
                    const platformCenterX = platform.x + platform.width / 2;
                    const horizontalDist = Math.abs(enemyX - platformCenterX);
                    const verticalDist = Math.abs(enemyY - platform.y);
                    
                    // Only consider platforms that are:
                    // 1. Above current position (but not too high)
                    // 2. Within reasonable jump range
                    if (platform.y < enemyY - 20 && verticalDist < 140 && horizontalDist < 200) {
                        if (!nextLevelPlatform || platform.y > nextLevelPlatform.y) {
                            // Prefer the lowest platform above (step-by-step climbing)
                            nextLevelPlatform = platform;
                        }
                    }
                });
                
                // Step 2: Check if player is reachable from current or next level
                const horizontalDistanceToPlayer = Math.abs(playerX - enemyX);
                const verticalDistanceToPlayer = Math.abs(playerY - enemyY);
                
                // Can reach player if they're on same level or one level up
                if (verticalDistanceToPlayer < 140 && horizontalDistanceToPlayer < 300) {
                    canReachPlayer = true;
                }
                
                // Step 3: Decision making
                if (canReachPlayer && horizontalDistanceToPlayer > 50) {
                    // Player is reachable - move directly towards player
                    if (playerX < enemyX) {
                        wantsToMoveLeft = true;
                        wantsToMoveRight = false;
                    } else {
                        wantsToMoveRight = true;
                        wantsToMoveLeft = false;
                    }
                } else if (nextLevelPlatform) {
                    // Player not directly reachable - climb to next level
                    const platformCenterX = nextLevelPlatform.x + nextLevelPlatform.width / 2;
                    const distanceToPlatform = Math.abs(enemyX - platformCenterX);
                    
                    // Check if enemy is under the platform (needs to move to edge to jump)
                    const enemyUnderPlatform = (enemyX + this.width/2 >= nextLevelPlatform.x && 
                                              enemyX + this.width/2 <= nextLevelPlatform.x + nextLevelPlatform.width);
                    
                    if (enemyUnderPlatform) {
                        // Enemy is directly under platform - move to nearest edge to avoid getting stuck
                        const leftEdgeDistance = Math.abs(enemyX - nextLevelPlatform.x);
                        const rightEdgeDistance = Math.abs((enemyX + this.width) - (nextLevelPlatform.x + nextLevelPlatform.width));
                        
                        if (leftEdgeDistance < rightEdgeDistance) {
                            // Move to left edge
                            wantsToMoveLeft = true;
                            wantsToMoveRight = false;
                        } else {
                            // Move to right edge  
                            wantsToMoveRight = true;
                            wantsToMoveLeft = false;
                        }
                    } else if (distanceToPlatform > 30) {
                        // Move towards the platform center
                        if (platformCenterX < enemyX) {
                            wantsToMoveLeft = true;
                            wantsToMoveRight = false;
                        } else {
                            wantsToMoveRight = true;
                            wantsToMoveLeft = false;
                        }
                    } else {
                        // Close enough to platform center, stop and prepare to jump
                        wantsToMoveLeft = false;
                        wantsToMoveRight = false;
                    }
                } else {
                    // No platform above - just move towards player horizontally (don't drop down aggressively)
                    if (horizontalDistanceToPlayer > 50) {
                        if (playerX < enemyX) {
                            wantsToMoveLeft = true;
                            wantsToMoveRight = false;
                        } else {
                            wantsToMoveRight = true;
                            wantsToMoveLeft = false;
                        }
                    }
                }
            }
        }
        } // End of exploration mode check
        
        // Strong enemy collision avoidance - prevent clustering
        let avoidanceForce = { x: 0, count: 0 };
        this.game.enemies.forEach(otherEnemy => {
            if (otherEnemy !== this && otherEnemy.active && !otherEnemy.frozen && !this.frozen) {
                const distance = Math.abs((this.x + this.width/2) - (otherEnemy.x + otherEnemy.width/2));
                const verticalDistance = Math.abs((this.y + this.height/2) - (otherEnemy.y + otherEnemy.height/2));
                
                // Much larger avoidance radius to prevent clustering
                if (distance < this.width + 80 && verticalDistance < this.height) {
                    avoidanceForce.count++;
                    
                    // Calculate repulsion force
                    if (this.x < otherEnemy.x) {
                        avoidanceForce.x -= 1; // Push left
                    } else {
                        avoidanceForce.x += 1; // Push right
                    }
                }
            }
        });
        
        // Apply strong avoidance if multiple enemies nearby
        if (avoidanceForce.count > 0) {
            if (avoidanceForce.x < 0) {
                wantsToMoveLeft = true;
                wantsToMoveRight = false;
                // Force immediate movement
                this.vx = Math.min(this.vx - 0.5, -this.currentSpeed);
            } else if (avoidanceForce.x > 0) {
                wantsToMoveRight = true;
                wantsToMoveLeft = false;
                // Force immediate movement
                this.vx = Math.max(this.vx + 0.5, this.currentSpeed);
            }
            
            // If 2+ enemies nearby, enter exploration mode immediately
            if (avoidanceForce.count >= 2) {
                this.explorationTimer = 3000; // Force 3 seconds exploration
                this.explorationDirection = avoidanceForce.x > 0 ? 1 : -1;
            }
        }
        
        // Apply acceleration-based movement (like player) - but adjust if preparing to jump
        if (this.isPreparingToJump && this.targetPlatformX > 0) {
            // Move towards target platform center while preparing to jump
            const enemyCenterX = this.x + this.width / 2;
            const distanceToTarget = Math.abs(enemyCenterX - this.targetPlatformX);
            
            if (distanceToTarget > 10) { // If not close enough to target
                if (this.targetPlatformX < enemyCenterX) {
                    // Move left towards target
                    this.vx -= this.acceleration * 0.5; // Slower movement while preparing
                    if (this.vx < -this.currentSpeed * 0.7) this.vx = -this.currentSpeed * 0.7;
                } else {
                    // Move right towards target
                    this.vx += this.acceleration * 0.5; // Slower movement while preparing
                    if (this.vx > this.currentSpeed * 0.7) this.vx = this.currentSpeed * 0.7;
                }
            } else {
                // Close enough to target, stop moving
                if (Math.abs(this.vx) < 0.1) {
                    this.vx = 0;
                } else {
                    this.vx *= this.game.friction * 0.3; // Stop faster when in position
                }
            }
        } else if (wantsToMoveLeft) {
            this.vx -= this.acceleration;
            if (this.vx < -this.currentSpeed) this.vx = -this.currentSpeed;
            this.facingRight = false; // Update facing direction
        } else if (wantsToMoveRight) {
            this.vx += this.acceleration;
            if (this.vx > this.currentSpeed) this.vx = this.currentSpeed;
            this.facingRight = true; // Update facing direction
        } else {
            // Apply friction when no input (like player)
            if (Math.abs(this.vx) < 0.1) {
                this.vx = 0;
            } else {
                this.vx *= this.game.friction;
            }
        }
        
        // Smart jumping - more aggressive platform seeking
        // Don't jump if affected by snow or frozen
        if (this.onGround && this.jumpCooldown <= 0 && this.snowHits === 0 && !this.frozen) {
            const playerAbove = playerY < enemyY - 30;
            const playerDistance = Math.abs(playerX - enemyX);
            
            // More aggressive jumping when player is above or nearby
            let shouldAttemptJump = false;
            let hasLandingPlatform = false;
            let landingPlatformX = 0;
            let bestPlatformDistance = Infinity;
            
            // First, check if there are any platforms above to jump to
            this.game.platforms.forEach(platform => {
                const jumpHeight = 140; // Balanced jump reach
                if (platform.y < enemyY && platform.y > enemyY - jumpHeight) {
                    // Check if enemy can reach this platform horizontally
                    const horizontalReach = 120;
                    const enemyCenterX = this.x + this.width / 2;
                    const platformCenterX = platform.x + platform.width / 2;
                    const horizontalDistance = Math.abs(enemyCenterX - platformCenterX);
                    
                    if (horizontalDistance < horizontalReach) {
                        // Prefer the lowest platform above (step-by-step climbing)
                        if (!hasLandingPlatform || platform.y > bestPlatformDistance) {
                            hasLandingPlatform = true;
                            landingPlatformX = platformCenterX;
                            bestPlatformDistance = platform.y; // Use Y coordinate to find lowest platform
                        }
                    }
                }
            });
            
            // Only consider jumping if there's a platform above
            if (hasLandingPlatform) {
                // Increased jump motivation - especially when player is above
                if (playerAbove && playerDistance < 400) {
                    shouldAttemptJump = Math.random() < 0.8; // 80% chance when player is above
                } else if (playerAbove && playerDistance < 600) {
                    shouldAttemptJump = Math.random() < 0.6; // 60% chance when player is above and far
                } else if (playerDistance < 150) {
                    shouldAttemptJump = Math.random() < 0.3; // 30% chance when very close
                } else {
                    shouldAttemptJump = Math.random() < 0.15; // 15% chance otherwise
                }
            } else {
                // No platform above - don't jump
                shouldAttemptJump = false;
            }
            
            // More aggressive jumping if just landed and player still above
            const justLandedBonus = this.justLanded && playerAbove ? 0.15 : 0; // 15% extra chance if just landed and player above
            
            // Extra bonus if player is directly above (within 60 pixels horizontally)
            const directlyAboveBonus = (Math.abs(playerX - enemyX) < 60 && playerAbove) ? 0.25 : 0; // 25% extra if directly above
            
            const personalityJumpChance = (0.05 + justLandedBonus + directlyAboveBonus) * this.aggressiveness; // Personality affects jump chance
            
            const shouldPrepareJump = shouldAttemptJump && hasLandingPlatform; // Only jump when motivated AND platform available
            
            if (shouldPrepareJump && !this.isPreparingToJump) {
                // Start preparing to jump
                this.isPreparingToJump = true;
                // Shorter preparation time for more responsive jumping
                const basePrepTime = this.justLanded ? (100 + Math.random() * 100) : (200 + Math.random() * 200);
                const personalityPrepTime = basePrepTime * Math.min(this.patience, 1.2); // Cap patience effect
                this.jumpPreparationTime = personalityPrepTime;
                this.targetPlatformX = landingPlatformX; // Remember target platform
            }
            
            // Execute jump after preparation
            if (this.isPreparingToJump && this.jumpPreparationTime <= 0) {
                this.vy = -this.jumpPower; // Use enemy's jump power
                this.onGround = false;
                this.jumpCooldown = 300 + Math.random() * 200; // Much shorter cooldown for continuous climbing
                this.isPreparingToJump = false;
                this.targetPlatformX = 0; // Reset target
            }
        }
        
        // Check if about to fall off platform and maybe jump
        const nextX = this.x + this.vx * 2; // Look ahead
        let willBeOnPlatform = false;
        
        this.game.platforms.forEach(platform => {
            if (this.y + this.height >= platform.y - 5 && 
                this.y + this.height <= platform.y + platform.height + 10 &&
                nextX + this.width > platform.x && 
                nextX < platform.x + platform.width) {
                willBeOnPlatform = true;
            }
        });
        
        // If about to fall off and on ground, prepare to jump or turn around
        // Don't jump if affected by snow or frozen
        if (!willBeOnPlatform && this.onGround && this.jumpCooldown <= 0 && !this.isPreparingToJump && 
            this.snowHits === 0 && !this.frozen) {
            const playerAbove = playerY < enemyY - 20; // Even more sensitive
            const playerNearby = Math.abs(playerX - enemyX) < 200; // Player is nearby
            
            if ((playerAbove || playerNearby) && Math.random() < 0.3) { // More reasonable chance to 30%
                // Find best platform to jump to
                let bestPlatform = null;
                let bestDistance = Infinity;
                
                this.game.platforms.forEach(platform => {
                    if (platform.y < enemyY && platform.y > enemyY - 140) {
                        const platformCenterX = platform.x + platform.width / 2;
                        const distance = Math.abs(platformCenterX - playerX); // Distance to player
                        if (distance < bestDistance) {
                            bestDistance = distance;
                            bestPlatform = platform;
                        }
                    }
                });
                
                this.isPreparingToJump = true;
                this.jumpPreparationTime = 400 + Math.random() * 200; // Shorter prep at edge
                this.targetPlatformX = bestPlatform ? bestPlatform.x + bestPlatform.width / 2 : playerX;
            } else if (Math.random() < 0.7) { // 70% chance to turn around - more defensive
                this.vx = -this.vx;
            } else { // 30% chance to prepare jump off - less risky
                this.isPreparingToJump = true;
                this.jumpPreparationTime = 400 + Math.random() * 200; // Shorter prep at edge
                this.targetPlatformX = playerX; // Jump towards player
            }
        }
        
        // Execute edge jump after preparation
        // Don't jump if affected by snow or frozen
        if (!willBeOnPlatform && this.onGround && this.isPreparingToJump && this.jumpPreparationTime <= 0 && 
            this.snowHits === 0 && !this.frozen) {
            this.vy = -this.jumpPower; // Use enemy's jump power
            this.onGround = false;
            this.jumpCooldown = 800;
            this.isPreparingToJump = false;
            this.targetPlatformX = 0; // Reset target
        }
        
        // Screen boundaries - STRICT enforcement
        if (this.x <= 0) {
            this.x = 0; // Force position back inside
            this.vx = Math.abs(this.vx); // Force movement to the right
        } else if (this.x + this.width >= this.game.canvas.width) {
            this.x = this.game.canvas.width - this.width; // Force position back inside
            this.vx = -Math.abs(this.vx); // Force movement to the left
        }
        
        // Apply gravity
        this.vy += this.game.gravity;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Platform collision - allow passing through from sides and bottom
        this.onGround = false;
        this.game.platforms.forEach(platform => {
            // Check if enemy is overlapping with platform (with tolerance for edges)
            const tolerance = 8; // 8px tolerance for better movement through gaps
            const overlapping = this.x + tolerance < platform.x + platform.width &&
                               this.x + this.width - tolerance > platform.x &&
                               this.y < platform.y + platform.height &&
                               this.y + this.height > platform.y;
            
            if (overlapping) {
                // Only land on platform if falling down and enemy's bottom was above platform before
                const enemyBottom = this.y + this.height;
                const enemyBottomPrevious = enemyBottom - this.vy;
                const enemyTop = this.y;
                const enemyTopPrevious = enemyTop - this.vy;
                
                // Landing on top of platform (falling down)
                if (this.vy > 0 && enemyBottomPrevious <= platform.y + 5) { // 5px tolerance
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    
                    // Mark as just landed for focused movement
                    if (!this.justLanded) {
                        this.justLanded = true;
                        this.landingFocusTime = 1500 + Math.random() * 1000; // 1.5-2.5 seconds focus on player
                        
                        // Reset jump cooldown when landing to allow immediate next jump
                        this.jumpCooldown = 0; // Allow immediate jumping after landing
                        
                        // If player is above, be even more motivated to jump again
                        if (playerY < this.y - 30) {
                            this.jumpCooldown = -100; // Negative cooldown = immediate jump readiness
                        }
                    }
                }
                // Passing through from bottom (jumping up) - allow passage
                else if (this.vy < 0 && enemyTopPrevious >= platform.y + platform.height - 5) {
                    // Allow enemy to pass through platform from below
                    // No collision response - enemy continues upward
                }
                // Side collision only for ground platforms (walls)
                else if (platform.type === 'ground') {
                    const enemyCenterX = this.x + this.width / 2;
                    const platformCenterX = platform.x + platform.width / 2;
                    
                    if (enemyCenterX < platformCenterX && this.vx > 0) {
                        // Hit from left
                        this.x = platform.x - this.width;
                        this.vx = -this.vx;
                    } else if (enemyCenterX > platformCenterX && this.vx < 0) {
                        // Hit from right
                        this.x = platform.x + platform.width;
                        this.vx = -this.vx;
                    }
                }
            }
        });
        
        // FINAL BOUNDARY CHECK - Ensure enemy never goes off screen
        if (this.x < 0) {
            this.x = 0;
            this.vx = Math.abs(this.vx); // Force movement to the right
        } else if (this.x + this.width > this.game.canvas.width) {
            this.x = this.game.canvas.width - this.width;
            this.vx = -Math.abs(this.vx); // Force movement to the left
        }
        
        // If enemy falls too far down, destroy it (fell off screen)
        if (this.y > this.game.canvas.height + 100) {
            console.log(`Enemy fell off screen! Destroying...`);
            this.destroy();
        }
    }
    
    addSnow() {
        this.snowHits++;
        console.log(`❄️ ENEMY HIT BY SNOW! snowHits=${this.snowHits}, frozen=${this.frozen}, x=${this.x.toFixed(1)}, y=${this.y.toFixed(1)}`);
        
        if (this.snowHits === 1) {
            console.log(`🟡 LEVEL 1 FREEZE: Enemy slowed down, will unfreeze in 1 second`);
            // 1st Hit: Slow down but keep normal appearance
            this.frozen = false; // NOT frozen yet - still looks normal
            this.currentSpeed = this.baseSpeed * 0.3; // 30% speed
            this.maxSpeed = this.baseSpeed * 0.3;
            this.vx = this.vx * 0.3; // Slow current movement
            
            // Cancel jump preparation
            this.isPreparingToJump = false;
            this.jumpPreparationTime = 0;
            
            // Visual effect - yellow particles (slowed)
            this.game.addParticle(this.x + this.width/2, this.y + this.height/2, '#FFFF00');
            
            // Set timer to unfreeze after 1 second
            setTimeout(() => {
                if (this.active && this.snowHits === 1) {
                    console.log(`🔥 LEVEL 1 MELTING: Unfreezing after 1 second`);
                    this.unfreeze();
                }
            }, 1000);
            
        } else if (this.snowHits === 2) {
            console.log(`🔵 LEVEL 2 FREEZE: Enemy very slow, will drop to Level 1 in 1 second`);
            // 2nd Hit: Very slow but still moving, starts to look frozen
            this.frozen = false; // Still NOT fully frozen - can move slowly
            this.currentSpeed = this.baseSpeed * 0.1; // 10% speed (very slow)
            this.maxSpeed = this.baseSpeed * 0.1;
            this.vx = this.vx * 0.1; // Very slow movement
            
            // Cancel jump preparation
            this.isPreparingToJump = false;
            this.jumpPreparationTime = 0;
            
            // Visual effect - blue particles (getting icy)
            this.game.addParticle(this.x + this.width/2, this.y + this.height/2, '#00FFFF');
            
            // Set timer to drop to Level 1 after 1 second
            setTimeout(() => {
                if (this.active && this.snowHits === 2) {
                    console.log(`🔽 LEVEL 2 DROPPING: Dropping to Level 1 after 1 second`);
                    this.snowHits = 1; // Drop to Level 1
                    
                    // Apply Level 1 settings
                    this.currentSpeed = this.baseSpeed * 0.3; // 30% speed
                    this.maxSpeed = this.baseSpeed * 0.3;
                    
                    // Set another timer to unfreeze after 1 more second
                    setTimeout(() => {
                        if (this.active && this.snowHits === 1) {
                            console.log(`🔥 LEVEL 1 MELTING: Unfreezing after Level 2 drop`);
                            this.unfreeze();
                        }
                    }, 1000);
                }
            }, 1000);
            
        } else if (this.snowHits >= 3) {
            console.log(`⚪ LEVEL 3 FREEZE: FULL SNOWBALL! Ready to push! snowHits=${this.snowHits}`);
            
            // 3rd Hit: Full snowball transformation - DIRECT SETUP
            this.frozen = true;
            this.currentSpeed = 0;
            this.maxSpeed = 0;
            this.vx = 0;
            // Don't reset vy - let enemy fall with gravity if in air
            
            // CRITICAL: Reset push state for new snowball
            this.isPushed = false;
            this.isRolling = false;
            
            // Set as fully frozen snowball - ready to be pushed
            this.frozenTime = 3000; // 3 seconds to melt
            this.canMelt = true; // Can melt after 3 seconds
            
            // Set timer to unfreeze after 3 seconds if not pushed
            setTimeout(() => {
                console.log(`⏰ SNOWBALL TIMER CHECK: active=${this.active}, frozen=${this.frozen}, snowHits=${this.snowHits}, isPushed=${this.isPushed}`);
                if (this.active && this.frozen && this.snowHits >= 3 && !this.isPushed) {
                    console.log(`🔥 SNOWBALL MELTING! Direct unfreeze after 3 seconds (no level drop)`);
                    this.unfreeze();
                } else {
                    console.log(`❌ SNOWBALL UNFREEZE BLOCKED: Conditions not met`);
                }
            }, 3000);
            
            // Cancel jump preparation
            this.isPreparingToJump = false;
            this.jumpPreparationTime = 0;
            
            console.log(`✅ SNOWBALL READY TO PUSH! frozen=${this.frozen}, snowHits=${this.snowHits}, frozenTime=${this.frozenTime}`);
            
            // Visual effect - white color (full snowball)
            this.game.addParticle(this.x + this.width/2, this.y + this.height/2, '#FFFFFF');
            
            // Add extra particles for full snowball effect
            for (let i = 0; i < 5; i++) {
                this.game.addParticle(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    '#FFFFFF'
                );
            }
        }
        
        // Snow melting system COMPLETELY REMOVED - no recovery allowed
        // Once hit by snow, effects are permanent until enemy dies
    }
    
    // freeze() method removed - now handled directly in addSnow() for 3rd hit
    
    unfreeze() {
        console.log(`🔥 ENEMY UNFREEZING! snowHits=${this.snowHits} → 0`);
        
        // Reset all snow effects
        this.frozen = false;
        this.snowHits = 0;
        this.frozenTime = 0;
        this.canMelt = true;
        
        // Reset push/rolling state
        this.isPushed = false;
        this.isRolling = false;
        this.rollSpeed = 0;
        
        // Restore movement capabilities
        this.maxSpeed = this.baseSpeed; // Restore to original speed
        this.currentSpeed = this.baseSpeed;
        
        // Add unfreeze particles
        for (let i = 0; i < 8; i++) {
            this.game.addParticle(
                this.x + Math.random() * this.width,
                this.y + Math.random() * this.height,
                '#FFD700' // Gold color for melting
            );
        }
    }
    
    push(direction) {
        console.log(`PUSH METHOD CALLED: frozen=${this.frozen}, snowHits=${this.snowHits}, isRolling=${this.isRolling}`);
        
        if (this.frozen && this.snowHits >= 3 && !this.isRolling) { // Only fully frozen, non-rolling enemies
            console.log(`PUSH CONDITIONS MET - EXECUTING PUSH`);
            
            // Push the frozen enemy with MAXIMUM force
            this.vx = direction * 25; // MAXIMUM push force
            this.vy = -5; // Higher bounce for better trajectory
            this.isPushed = true;
            this.rollSpeed = direction * 25; // MAXIMUM rolling speed
            this.isRolling = true;
            this.rollStartTime = Date.now(); // Track when rolling started
            
            // DISABLE ALL MELTING - enemy will never recover
            this.frozenTime = 999999; // Infinite frozen time - no melting
            this.canMelt = false; // Flag to prevent any melting
            
            console.log(`PUSH EXECUTED: vx=${this.vx}, vy=${this.vy}, rollSpeed=${this.rollSpeed}, isRolling=${this.isRolling}`);
            
            // Add MASSIVE push effect particles
            for (let i = 0; i < 8; i++) {
                this.game.addParticle(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    '#FFFFFF'
                );
            }
            
            // Add blue ice particles for dramatic effect
            for (let i = 0; i < 5; i++) {
                this.game.addParticle(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    '#87CEEB'
                );
            }
            
            return true; // Indicate successful push
        }
        
        console.log(`PUSH CONDITIONS NOT MET`);
        return false; // Indicate failed push
    }
    
    destroy() {
        this.active = false;
        this.game.score += 100;
        this.game.addParticle(this.x + this.width/2, this.y + this.height/2, this.color);
        
        // Enemy destroyed successfully
    }
    
    render(ctx) {
        if (!this.active) return;
        
        if (this.frozen) {
            // Draw as snowball
            ctx.fillStyle = '#E6F3FF';
            ctx.strokeStyle = '#B0D4F1';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Add sparkles
            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < 3; i++) {
                const sparkleX = this.x + Math.random() * this.width;
                const sparkleY = this.y + Math.random() * this.height;
                ctx.fillRect(sparkleX, sparkleY, 2, 2);
            }
        } else {
            // Draw enemy with image if loaded, otherwise fallback to colored rectangle
            const jumpCompress = this.isPreparingToJump ? 0.9 : 1.0;
            const compressedHeight = this.height * jumpCompress;
            const yOffset = this.height - compressedHeight;
            
            if (this.imagesLoaded) {
                // Always use the right-facing image and flip for left direction
                ctx.save();
                
                if (this.facingRight) {
                    // Normal right-facing image
                    ctx.drawImage(
                        this.imageRight,
                        this.x,
                        this.y + yOffset,
                        this.width,
                        compressedHeight
                    );
                } else {
                    // Flip horizontally for left movement (like main character)
                    ctx.translate(this.x + this.width, this.y + yOffset);
                    ctx.scale(-1, 1);
                    ctx.drawImage(
                        this.imageRight,
                        0,
                        0,
                        this.width,
                        compressedHeight
                    );
                }
                
                ctx.restore();
            } else {
                // Fallback to colored rectangle while images load
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y + yOffset, this.width, compressedHeight);
                
                // Eyes - 1.8x scaled, adjusted for jump compression
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(this.x + 10, this.y + yOffset + 10, 8, 8);
                ctx.fillRect(this.x + 32, this.y + yOffset + 10, 8, 8);
                
                ctx.fillStyle = '#000000';
                ctx.fillRect(this.x + 14, this.y + yOffset + 14, 4, 4);
                ctx.fillRect(this.x + 36, this.y + yOffset + 14, 4, 4);
            }
            
            // Show snow accumulation based on hit count (after image rendering)
            if (this.snowHits === 1) {
                // 1st Hit: Yellow overlay (stopped)
                ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
                ctx.fillRect(this.x, this.y + yOffset, this.width, compressedHeight);
                
                // Stop effect - yellow dots
                ctx.fillStyle = '#FFFF00';
                for (let i = 0; i < 4; i++) {
                    const dotX = this.x + (i * 10) + 8;
                    const dotY = this.y + yOffset + 8 + (i % 2) * 12;
                    ctx.fillRect(dotX, dotY, 3, 3);
                }
                
            } else if (this.snowHits === 2) {
                // 2nd Hit: Blue overlay (medium freeze)
                ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
                ctx.fillRect(this.x, this.y + yOffset, this.width, compressedHeight);
                
                // Medium freeze effect - blue icy appearance
                ctx.fillStyle = '#00FFFF';
                for (let i = 0; i < 8; i++) {
                    const dotX = this.x + (i * 6) + 5;
                    const dotY = this.y + yOffset + 5 + (i % 3) * 10;
                    ctx.fillRect(dotX, dotY, 2, 2);
                }
                
            } else if (this.snowHits >= 3) {
                // 3rd Hit: White overlay (full snowball)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillRect(this.x, this.y + yOffset, this.width, compressedHeight);
                
                // Full snowball effect - white snow particles
                ctx.fillStyle = '#FFFFFF';
                for (let i = 0; i < 12; i++) {
                    const dotX = this.x + (i * 4) + 3;
                    const dotY = this.y + yOffset + 3 + (i % 4) * 8;
                    ctx.fillRect(dotX, dotY, 2, 2);
                }
            }
            
            // Speed indicator - make snow slowdown visible
            if (this.currentSpeed < this.baseSpeed) {
                ctx.fillStyle = 'rgba(0, 100, 255, 0.6)';
                const speedRatio = this.currentSpeed / this.baseSpeed;
                ctx.fillRect(this.x, this.y - 8, this.width * speedRatio, 4);
                
                // Arka plan çubuğu
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(this.x, this.y - 8, this.width, 4);
                
                // Hız çubuğu
                ctx.fillStyle = 'rgba(0, 100, 255, 0.8)';
                ctx.fillRect(this.x, this.y - 8, this.width * speedRatio, 4);
            }
        }
    }
    
    // Update which platform level the enemy is currently on
    updatePlatformLevel() {
        let currentLevel = 0; // Ground level
        
        // Find the platform the enemy is standing on
        this.game.platforms.forEach((platform, index) => {
            if (this.x + this.width/2 >= platform.x && 
                this.x + this.width/2 <= platform.x + platform.width &&
                Math.abs(this.y + this.height - platform.y) < 10) {
                // Enemy is on this platform
                currentLevel = Math.floor(platform.y / 100); // Rough level calculation
            }
        });
        
        this.currentPlatformLevel = currentLevel;
    }
    
    // Get the platform the player is currently on
    getPlayerPlatform() {
        const player = this.game.player;
        const playerCenterX = player.x + player.width/2;
        const playerBottom = player.y + player.height;
        
        for (let platform of this.game.platforms) {
            if (playerCenterX >= platform.x && 
                playerCenterX <= platform.x + platform.width &&
                Math.abs(playerBottom - platform.y) < 15) {
                return platform;
            }
        }
        return null;
    }
    
    // Smart pathfinding that considers intermediate platforms
    findSmartPath(targetX, targetY) {
        const enemyX = this.x + this.width/2;
        const enemyY = this.y + this.height/2;
        const currentPlatform = this.getCurrentPlatform();
        
        if (!currentPlatform) return null;
        
        // Find all platforms that could be intermediate steps
        const platforms = this.game.platforms.filter(p => p !== currentPlatform);
        let bestPath = null;
        let shortestDistance = Infinity;
        
        // Try direct path first
        const directPath = this.findDirectPath(targetX, targetY);
        if (directPath) {
            bestPath = directPath;
            shortestDistance = Math.abs(enemyX - targetX) + Math.abs(enemyY - targetY);
        }
        
        // Try paths through intermediate platforms
        platforms.forEach(intermediatePlatform => {
            const intermediateX = intermediatePlatform.x + intermediatePlatform.width/2;
            const intermediateY = intermediatePlatform.y;
            
            // Check if this intermediate platform helps us get closer to target
            const distanceToIntermediate = Math.abs(enemyX - intermediateX) + Math.abs(enemyY - intermediateY);
            const distanceFromIntermediateToTarget = Math.abs(intermediateX - targetX) + Math.abs(intermediateY - targetY);
            const totalDistance = distanceToIntermediate + distanceFromIntermediateToTarget;
            
            // Only consider if it's reachable and gets us closer
            if (distanceToIntermediate < 300 && totalDistance < shortestDistance) {
                // Check if we can jump to intermediate platform
                if (this.canReachPlatform(currentPlatform, intermediatePlatform)) {
                    bestPath = {
                        action: 'move_to_intermediate',
                        targetX: intermediateX,
                        intermediatePlatform: intermediatePlatform,
                        finalTarget: { x: targetX, y: targetY }
                    };
                    shortestDistance = totalDistance;
                }
            }
        });
        
        return bestPath;
    }
    
    // Check if we can reach a platform from current position
    canReachPlatform(fromPlatform, toPlatform) {
        const horizontalDistance = Math.abs(
            (fromPlatform.x + fromPlatform.width/2) - (toPlatform.x + toPlatform.width/2)
        );
        const verticalDistance = Math.abs(fromPlatform.y - toPlatform.y);
        
        // Can reach if horizontal distance is reasonable and vertical is within jump range
        return horizontalDistance < 200 && verticalDistance < 120;
    }
    
    // Find direct path to target
    findDirectPath(targetX, targetY) {
        const enemyX = this.x + this.width/2;
        const enemyY = this.y + this.height/2;
        const horizontalDistance = Math.abs(enemyX - targetX);
        const verticalDistance = Math.abs(enemyY - targetY);
        
        // If target is above and reachable
        if (targetY < enemyY - 30 && horizontalDistance < 170 && verticalDistance < 120) {
            return {
                action: 'jump_to_platform',
                targetX: targetX,
                direct: true
            };
        }
        
        // If target is below, move to edge
        if (targetY > enemyY + 30) {
            const currentPlatform = this.getCurrentPlatform();
            if (currentPlatform) {
                const leftEdge = currentPlatform.x;
                const rightEdge = currentPlatform.x + currentPlatform.width;
                const distToLeft = Math.abs(enemyX - leftEdge);
                const distToRight = Math.abs(enemyX - rightEdge);
                
                return {
                    action: 'move_to_edge',
                    direction: distToLeft < distToRight ? -1 : 1,
                    targetX: distToLeft < distToRight ? leftEdge : rightEdge
                };
            }
        }
        
        return null;
    }
    
    // Smart pathfinding - find the best way to reach target level
    findPathToLevel(targetLevel) {
        if (this.pathfindingCooldown > 0) return null;
        
        const currentLevel = this.currentPlatformLevel;
        if (currentLevel === targetLevel) return null;
        
        // Anger-based pathfinding speed - higher anger = faster pathfinding
        const angerLevel = this.game.angerLevel || 0;
        const baseCooldown = 500; // 0.5 seconds
        const angerReduction = (angerLevel / 100) * 300; // Up to 300ms reduction at 100% anger
        this.pathfindingCooldown = Math.max(200, baseCooldown - angerReduction); // Min 200ms cooldown
        
        // If target is below, find nearest platform edge to drop down
        if (targetLevel > currentLevel) {
            return this.findDropPath();
        }
        // If target is above, find nearest platform to jump up
        else {
            return this.findJumpPath();
        }
    }
    
    // Find path to drop down to lower level
    findDropPath() {
        const currentPlatform = this.getCurrentPlatform();
        if (!currentPlatform) return null;
        
        const angerLevel = this.game.angerLevel || 0;
        const playerX = this.game.player.x + this.game.player.width/2;
        
        // At high anger, prefer the edge closest to player for faster pursuit
        const leftEdge = currentPlatform.x;
        const rightEdge = currentPlatform.x + currentPlatform.width;
        const enemyCenter = this.x + this.width/2;
        
        let targetEdge, direction;
        
        if (angerLevel >= 60) {
            // High anger: Choose edge closest to player for aggressive pursuit
            const distToLeftFromPlayer = Math.abs(playerX - leftEdge);
            const distToRightFromPlayer = Math.abs(playerX - rightEdge);
            
            if (distToLeftFromPlayer < distToRightFromPlayer) {
                targetEdge = leftEdge;
                direction = -1;
            } else {
                targetEdge = rightEdge;
                direction = 1;
            }
            console.log(`🔥 ANGRY DROP: Choosing edge closest to player (anger=${angerLevel}%)`);
        } else {
            // Normal: Choose closest edge to enemy
            const distToLeft = Math.abs(enemyCenter - leftEdge);
            const distToRight = Math.abs(enemyCenter - rightEdge);
            
            if (distToLeft < distToRight) {
                targetEdge = leftEdge;
                direction = -1;
            } else {
                targetEdge = rightEdge;
                direction = 1;
            }
        }
        
        return {
            action: 'move_to_edge',
            direction: direction,
            targetX: targetEdge
        };
    }
    
    // Find path to jump up to higher level
    findJumpPath() {
        const enemyX = this.x + this.width/2;
        const enemyY = this.y;
        const currentPlatform = this.getCurrentPlatform();
        
        if (!currentPlatform) return null;
        
        // First, look for platforms on the same level that can lead to upper platforms
        let bestRoute = null;
        let shortestTotalDistance = Infinity;
        
        // Check direct jump to upper platforms
        this.game.platforms.forEach(upperPlatform => {
            if (upperPlatform.y < enemyY - 50) { // Platform is above
                const platformCenterX = upperPlatform.x + upperPlatform.width/2;
                const directDistance = Math.abs(enemyX - platformCenterX);
                
                // If we can reach it directly - increased range for better climbing
                if (directDistance < 200) {
                    const totalDistance = directDistance;
                    if (totalDistance < shortestTotalDistance) {
                        bestRoute = {
                            action: 'jump_to_platform',
                            targetX: platformCenterX,
                            platform: upperPlatform,
                            type: 'direct'
                        };
                        shortestTotalDistance = totalDistance;
                    }
                }
                // If we can't reach directly, look for intermediate platforms
                else {
                    this.game.platforms.forEach(intermediatePlatform => {
                        // Same level as current platform
                        if (Math.abs(intermediatePlatform.y - currentPlatform.y) < 20 && 
                            intermediatePlatform !== currentPlatform) {
                            
                            const intermediateX = intermediatePlatform.x + intermediatePlatform.width/2;
                            const distanceToIntermediate = Math.abs(enemyX - intermediateX);
                            const distanceFromIntermediate = Math.abs(intermediateX - platformCenterX);
                            
                            // Check if intermediate platform can reach the upper platform - increased ranges
                            if (distanceFromIntermediate < 200 && distanceToIntermediate < 400) {
                                const totalDistance = distanceToIntermediate + distanceFromIntermediate;
                                if (totalDistance < shortestTotalDistance) {
                                    bestRoute = {
                                        action: 'move_to_intermediate',
                                        targetX: intermediateX,
                                        intermediatePlatform: intermediatePlatform,
                                        finalPlatform: upperPlatform,
                                        type: 'indirect'
                                    };
                                    shortestTotalDistance = totalDistance;
                                }
                            }
                        }
                    });
                }
            }
        });
        
        return bestRoute;
    }
    
    // Get the platform enemy is currently standing on
    getCurrentPlatform() {
        const enemyCenter = this.x + this.width/2;
        const enemyBottom = this.y + this.height;
        
        for (let platform of this.game.platforms) {
            if (enemyCenter >= platform.x && 
                enemyCenter <= platform.x + platform.width &&
                Math.abs(enemyBottom - platform.y) < 10) {
                return platform;
            }
        }
        return null;
    }
    
    updateAngerSpeed(angerLevel) {
        // Calculate speed multiplier based on anger level (0% to 100%)
        // At 0%: 1.0x speed, At 100%: 2.0x speed
        this.angerSpeedMultiplier = 1.0 + (angerLevel / 100);
        
        // Update current speeds (but preserve freeze effects)
        if (!this.frozen && this.snowHits === 0) {
            // Only update if enemy is not frozen or slowed by snow
            this.maxSpeed = this.baseSpeed * this.angerSpeedMultiplier;
            this.currentSpeed = this.baseSpeed * this.angerSpeedMultiplier;
        } else if (this.snowHits === 1) {
            // Level 1 freeze: 30% of anger-adjusted speed
            this.maxSpeed = this.baseSpeed * this.angerSpeedMultiplier * 0.3;
            this.currentSpeed = this.baseSpeed * this.angerSpeedMultiplier * 0.3;
        } else if (this.snowHits === 2) {
            // Level 2 freeze: 10% of anger-adjusted speed
            this.maxSpeed = this.baseSpeed * this.angerSpeedMultiplier * 0.1;
            this.currentSpeed = this.baseSpeed * this.angerSpeedMultiplier * 0.1;
        }
        // Level 3 (snowball) stays at 0 speed regardless of anger
        
        console.log(`🔥 Enemy anger speed updated: ${angerLevel}% -> ${this.angerSpeedMultiplier.toFixed(2)}x speed`);
    }
    
    checkWallCollision(platform) {
        platform.walls.forEach(wall => {
            const wallWidth = wall.width || 8; // Default 8px if not specified
            let wallX, wallY, wallW, wallH;
            
            switch(wall.type) {
                case 'left':
                    // Sol taraftan yukarı duvar
                    wallX = platform.x;
                    wallY = platform.y + platform.height;
                    wallW = wallWidth;
                    wallH = wall.height;
                    break;
                case 'right':
                    // Sağ taraftan yukarı duvar
                    wallX = platform.x + platform.width - wallWidth;
                    wallY = platform.y + platform.height;
                    wallW = wallWidth;
                    wallH = wall.height;
                    break;
                case 'left-down':
                    // Sol taraftan aşağı duvar
                    wallX = platform.x;
                    wallY = platform.y - wall.height;
                    wallW = wallWidth;
                    wallH = wall.height;
                    break;
                case 'right-down':
                    // Sağ taraftan aşağı duvar
                    wallX = platform.x + platform.width - wallWidth;
                    wallY = platform.y - wall.height;
                    wallW = wallWidth;
                    wallH = wall.height;
                    break;
            }
            
            // Check collision with wall
            if (this.x < wallX + wallW &&
                this.x + this.width > wallX &&
                this.y < wallY + wallH &&
                this.y + this.height > wallY) {
                
                // Determine collision side and respond
                const enemyCenterX = this.x + this.width / 2;
                const wallCenterX = wallX + wallW / 2;
                
                if (enemyCenterX < wallCenterX && this.vx > 0) {
                    // Hit wall from left
                    this.x = wallX - this.width;
                    this.vx = 0;
                    // Turn around when hitting wall
                    if (!this.frozen && !this.isRolling) {
                        this.vx = -Math.abs(this.currentSpeed);
                    }
                } else if (enemyCenterX > wallCenterX && this.vx < 0) {
                    // Hit wall from right
                    this.x = wallX + wallW;
                    this.vx = 0;
                    // Turn around when hitting wall
                    if (!this.frozen && !this.isRolling) {
                        this.vx = Math.abs(this.currentSpeed);
                    }
                }
            }
        });
    }
}
