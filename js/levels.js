function getLevelPlatforms(levelNum) {
        const levelIndex = ((levelNum - 1) % 10) + 1; // Cycle through 10 different level designs
        
        switch(levelIndex) {
            case 1: // Level 1 - Based on reference design
                return [
                    { x: 0, y: 560, width: 800, height: 90, type: 'ground' },
                    
                    // Bottom level - 3 short platforms
                    { x: 60, y: 450, width: 140, height: 45, type: 'platform' },    
                    { x: 330, y: 450, width: 140, height: 45, type: 'platform' },   
                    { x: 600, y: 450, width: 140, height: 45, type: 'platform' },   
                    
                    // Middle level - single long platform (centered)
                    { x: 200, y: 340, width: 400, height: 45, type: 'platform' },   
                    
                    // Upper-middle level - 2 platforms (on sides)
                    { x: 80, y: 230, width: 200, height: 45, type: 'platform' },    
                    { x: 520, y: 230, width: 200, height: 45, type: 'platform' },   
                    
                    // Top level - medium platform (can drop from edges)
                    { x: 250, y: 120, width: 300, height: 45, type: 'platform' },
                ];
                
            case 2: // Level 2 - Multi-layered symmetric design with wider gaps
                return [
                    { x: 0, y: 560, width: 800, height: 90, type: 'ground' },
                    
                    // Top level - 2 long platforms (like image)
                    { x: 90, y: 120, width: 200, height: 45, type: 'platform' },    // Left top
                    { x: 500, y: 120, width: 200, height: 45, type: 'platform' },   // Right top
                    
                    // Upper-middle level - Full width platform with gaps (120px gap)
                    { x: 150, y: 230, width: 500, height: 45, type: 'platform' },   // Long center platform
                    
                    // Middle level - 4 medium platforms in symmetric pattern (120px gap)
                    { x: 10, y: 340, width: 140, height: 45, type: 'platform' },    // Left
                    { x: 290, y: 340, width: 200, height: 45, type: 'platform' },   // Center-left
                    { x: 630, y: 340, width: 160, height: 45, type: 'platform' },   // Right
                    
                    // Lower-middle level - 2 wider platforms (120px gap)
                    { x: 120, y: 450, width: 180, height: 45, type: 'platform' },   // Left
                    { x: 500, y: 450, width: 180, height: 45, type: 'platform' },   // Right
                ];
                
            case 3: // Level 3 - Snow Bros style stepped asymmetric design
                return [
                    { x: 0, y: 560, width: 800, height: 90, type: 'ground' },
                    
                    // Bottom level - 2 long platforms on sides (wide gaps)
                    { x: 80, y: 450, width: 230, height: 45, type: 'platform' },    // Left long
                    { x: 470, y: 450, width: 230, height: 45, type: 'platform'},    
            
                       
                    
                    // Lower-middle level - Single long center platform (120px gap)
                    { x: 200, y: 340, width: 370, height: 45, type: 'platform' },   // Long center
                    
                    // Middle level - 2 medium platforms (asymmetric) (120px gap)
                    { x: 200, y: 230, width: 370, height: 45, type: 'platform'   ,
                        walls: [{ type: 'right', height: 65, width: 50 },
                            { type: 'left', height: 65, width: 50 }],
                    },   // Right
                    
                    // Top level - Single center platform (120px gap)
                    { x: 0, y: 120, width: 230, height: 45, type: 'platform' },   // Center top
                    { x: 340, y: 120, width: 150, height: 45, type: 'platform' },   // Center top
                    { x: 620, y: 120, width: 180, height: 45, type: 'platform' },   // Center top

                ];
                
            case 4: // Level 4 - Snow Bros style pyramid design
                return [
                    { x: 0, y: 560, width: 800, height: 90, type: 'ground' },
                    
                    // Bottom level - 4 small platforms (wide gaps)
                    { x: 0, y: 450, width: 120, height: 45, type: 'platform' },    // Far left
                    { x: 230, y: 450, width: 120, height: 45, type: 'platform' },   // Center-left
                    { x: 450, y: 450, width: 120, height: 45, type: 'platform' },   // Center-right
                    { x: 680, y: 450, width: 120, height: 45, type: 'platform' },   // Far right
                    
                    // Lower-middle level - 3 medium platforms (120px gap)
                    { x: 100, y: 340, width: 150, height: 45, type: 'platform' },   // Left
                    { x: 325, y: 340, width: 150, height: 45, type: 'platform' },   // Center
                    { x: 550, y: 340, width: 150, height: 45, type: 'platform' },   // Right
                    
                    // Upper-middle level - 2 wider platforms (120px gap)
                    { x: 150, y: 230, width: 180, height: 45, type: 'platform' },   // Left
                    { x: 470, y: 230, width: 180, height: 45, type: 'platform' },   // Right
                    
                    // Top level - Single center platform (120px gap)
                    { x: 325, y: 120, width: 150, height: 45, type: 'platform' },   // Center top
                ];
                
            case 5: // Level 5 - Progressive platform complexity design
                return [
                    { x: 0, y: 560, width: 800, height: 90, type: 'ground' },
                    
                    // 1. KAT - Uzun ve geniş platform tam ortada (120px gap)
                    { x: 150, y: 450, width: 500, height: 45, type: 'platform' },   // Long wide center platform
                    
                    // 2. KAT - Daha parçalı platformlar (120px gap)
                    { x: 80, y: 340, width: 160, height: 45, type: 'platform'},
                    { x: 360, y: 340, width: 140, height: 45, type: 'platform'},   // Center-left piece
                    { x: 640, y: 340, width: 140, height: 45, type: 'platform'},
                    
                    // 3. KAT - Daha da sık ve kenarlara yaslanmış (120px gap)
                    { x: 20, y: 230, width: 200, height: 45, type: 'platform' },    // Far left edge
                    
                    { x: 380, y: 230, width: 80, height: 45, type: 'platform' },    // Center-right
                    
                    { x: 570, y: 230, width: 200, height: 45, type: 'platform' },   // Far right edge
                    
                    // 4. KAT - En üst, minimal platformlar (120px gap)
                    { x: 300, y: 120, width: 350, height: 45, type: 'platform' },   // Single center platform
                ];
                
            case 6: // Vertical challenge (Floor 06 style)
                return [
                    { x: 0, y: 550, width: 800, height: 50, type: 'ground' },
                    { x: 0, y: 480, width: 100, height: 25, type: 'platform' },
                    { x: 700, y: 480, width: 100, height: 25, type: 'platform' },
                    { x: 150, y: 430, width: 100, height: 25, type: 'platform' },
                    { x: 550, y: 430, width: 100, height: 25, type: 'platform' },
                    { x: 300, y: 380, width: 200, height: 25, type: 'platform' },
                    { x: 100, y: 330, width: 100, height: 25, type: 'platform' },
                    { x: 600, y: 330, width: 100, height: 25, type: 'platform' },
                    { x: 250, y: 280, width: 100, height: 25, type: 'platform' },
                    { x: 450, y: 280, width: 100, height: 25, type: 'platform' },
                    { x: 350, y: 230, width: 100, height: 25, type: 'platform' },
                    { x: 300, y: 180, width: 200, height: 25, type: 'platform' },
                ];
                
            case 7: // Scattered platforms (Floor 07 style)
                return [
                    { x: 0, y: 550, width: 800, height: 50, type: 'ground' },
                    { x: 80, y: 480, width: 120, height: 25, type: 'platform' },
                    { x: 280, y: 480, width: 120, height: 25, type: 'platform' },
                    { x: 480, y: 480, width: 120, height: 25, type: 'platform' },
                    { x: 680, y: 480, width: 120, height: 25, type: 'platform' },
                    { x: 40, y: 410, width: 100, height: 25, type: 'platform' },
                    { x: 220, y: 410, width: 100, height: 25, type: 'platform' },
                    { x: 400, y: 410, width: 100, height: 25, type: 'platform' },
                    { x: 580, y: 410, width: 100, height: 25, type: 'platform' },
                    { x: 160, y: 340, width: 120, height: 25, type: 'platform' },
                    { x: 360, y: 340, width: 120, height: 25, type: 'platform' },
                    { x: 560, y: 340, width: 120, height: 25, type: 'platform' },
                    { x: 260, y: 270, width: 100, height: 25, type: 'platform' },
                    { x: 440, y: 270, width: 100, height: 25, type: 'platform' },
                    { x: 350, y: 200, width: 100, height: 25, type: 'platform' },
                ];
                
            case 8: // Cross pattern (Floor 08 style)
                return [
                    { x: 0, y: 550, width: 800, height: 50, type: 'ground' },
                    { x: 100, y: 480, width: 600, height: 25, type: 'platform' },
                    { x: 200, y: 430, width: 100, height: 25, type: 'platform' },
                    { x: 500, y: 430, width: 100, height: 25, type: 'platform' },
                    { x: 300, y: 380, width: 200, height: 25, type: 'platform' },
                    { x: 150, y: 330, width: 100, height: 25, type: 'platform' },
                    { x: 550, y: 330, width: 100, height: 25, type: 'platform' },
                    { x: 250, y: 280, width: 300, height: 25, type: 'platform' },
                    { x: 100, y: 230, width: 100, height: 25, type: 'platform' },
                    { x: 600, y: 230, width: 100, height: 25, type: 'platform' },
                    { x: 200, y: 180, width: 400, height: 25, type: 'platform' },
                    { x: 350, y: 130, width: 100, height: 25, type: 'platform' },
                ];
                
            case 9: // Spiral design (Floor 09 style)
                return [
                    { x: 0, y: 550, width: 800, height: 50, type: 'ground' },
                    { x: 0, y: 480, width: 200, height: 25, type: 'platform' },
                    { x: 300, y: 480, width: 500, height: 25, type: 'platform' },
                    { x: 0, y: 430, width: 150, height: 25, type: 'platform' },
                    { x: 250, y: 430, width: 100, height: 25, type: 'platform' },
                    { x: 450, y: 430, width: 350, height: 25, type: 'platform' },
                    { x: 50, y: 380, width: 200, height: 25, type: 'platform' },
                    { x: 350, y: 380, width: 200, height: 25, type: 'platform' },
                    { x: 650, y: 380, width: 150, height: 25, type: 'platform' },
                    { x: 150, y: 330, width: 300, height: 25, type: 'platform' },
                    { x: 550, y: 330, width: 150, height: 25, type: 'platform' },
                    { x: 250, y: 280, width: 200, height: 25, type: 'platform' },
                    { x: 550, y: 280, width: 100, height: 25, type: 'platform' },
                    { x: 300, y: 230, width: 200, height: 25, type: 'platform' },
                    { x: 350, y: 180, width: 100, height: 25, type: 'platform' },
                ];
                
            case 10: // Final boss style (Floor 10 style)
                return [
                    { x: 0, y: 550, width: 800, height: 50, type: 'ground' },
                    { x: 50, y: 500, width: 100, height: 25, type: 'platform' },
                    { x: 650, y: 500, width: 100, height: 25, type: 'platform' },
                    { x: 100, y: 450, width: 100, height: 25, type: 'platform' },
                    { x: 600, y: 450, width: 100, height: 25, type: 'platform' },
                    { x: 150, y: 400, width: 100, height: 25, type: 'platform' },
                    { x: 550, y: 400, width: 100, height: 25, type: 'platform' },
                    { x: 200, y: 350, width: 400, height: 25, type: 'platform' },
                    { x: 100, y: 300, width: 100, height: 25, type: 'platform' },
                    { x: 600, y: 300, width: 100, height: 25, type: 'platform' },
                    { x: 250, y: 250, width: 300, height: 25, type: 'platform' },
                    { x: 350, y: 200, width: 100, height: 25, type: 'platform' },
                    { x: 300, y: 150, width: 200, height: 25, type: 'platform' },
                ];
                
            default:
                return getLevelPlatforms(1); // Fallback to level 1
        }
    }
