#!/usr/bin/env node

/**
 * Bell24H.com Project Completion Analyzer
 * Analyzes features.md and todo.md to determine actual completion percentage
 * and deployment readiness
 */

const fs = require('fs');
const path = require('path');

class ProjectAnalyzer {
    constructor(projectPath) {
        this.projectPath = projectPath;
        this.featuresData = null;
        this.todoData = null;
        this.completionReport = {
            totalFeatures: 0,
            completedFeatures: 0,
            inProgressFeatures: 0,
            pendingFeatures: 0,
            criticalBlockers: [],
            deploymentReadiness: {
                score: 0,
                blockers: [],
                recommendations: []
            }
        };
    }

    // Read and parse features.md file
    async readFeaturesFile() {
        try {
            const featuresPath = path.join(this.projectPath, 'docs', 'features.md');
            this.featuresData = fs.readFileSync(featuresPath, 'utf8');
            console.log('✅ Features.md file loaded successfully');
            return true;
        } catch (error) {
            console.error('❌ Error reading features.md:', error.message);
            return false;
        }
    }

    // Read and parse todo.md file
    async readTodoFile() {
        try {
            const todoPath = path.join(this.projectPath, 'docs', 'todo.md');
            this.todoData = fs.readFileSync(todoPath, 'utf8');
            console.log('✅ Todo.md file loaded successfully');
            return true;
        } catch (error) {
            console.error('❌ Error reading todo.md:', error.message);
            return false;
        }
    }

    // Parse feature completion status from markdown
    parseFeatureStatus() {
        if (!this.featuresData) return;

        const lines = this.featuresData.split('\n');
        let currentSection = '';
        
        lines.forEach(line => {
            // Check for feature status indicators
            if (line.includes('✅') || line.includes('[x]') || line.includes('COMPLETED')) {
                this.completionReport.completedFeatures++;
            } else if (line.includes('⏳') || line.includes('IN PROGRESS') || line.includes('PARTIAL')) {
                this.completionReport.inProgressFeatures++;
            } else if (line.includes('❌') || line.includes('[ ]') || line.includes('TODO') || line.includes('PENDING')) {
                this.completionReport.pendingFeatures++;
            }
            
            // Track section headers
            if (line.startsWith('#')) {
                currentSection = line.replace(/#+\s*/, '');
            }
        });

        this.completionReport.totalFeatures = 
            this.completionReport.completedFeatures + 
            this.completionReport.inProgressFeatures + 
            this.completionReport.pendingFeatures;
    }

    // Parse todo items and priority
    parseTodoItems() {
        if (!this.todoData) return;

        const lines = this.todoData.split('\n');
        let criticalTodos = [];
        let highPriorityTodos = [];
        let completedTodos = [];

        lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            
            if (lowerLine.includes('critical') || lowerLine.includes('blocker') || lowerLine.includes('urgent')) {
                if (!lowerLine.includes('✅') && !lowerLine.includes('[x]')) {
                    criticalTodos.push(line.trim());
                }
            }
            
            if (lowerLine.includes('high priority') || lowerLine.includes('important')) {
                if (!lowerLine.includes('✅') && !lowerLine.includes('[x]')) {
                    highPriorityTodos.push(line.trim());
                }
            }
            
            if (lowerLine.includes('✅') || lowerLine.includes('[x]')) {
                completedTodos.push(line.trim());
            }
        });

        this.completionReport.criticalBlockers = criticalTodos;
        this.completionReport.highPriorityItems = highPriorityTodos;
        this.completionReport.completedTodos = completedTodos;
    }

    // Check deployment readiness criteria
    assessDeploymentReadiness() {
        let score = 0;
        const blockers = [];
        const recommendations = [];

        // Core functionality check (40 points)
        const coreFeatures = [
            'Authentication System',
            'RFQ Management',
            'Supplier Management', 
            'Quote Management',
            'Payment Integration',
            'User Dashboard'
        ];

        coreFeatures.forEach(feature => {
            if (this.checkFeatureCompletion(feature)) {
                score += 6.67; // 40/6 = 6.67 points per core feature
            } else {
                blockers.push(`❌ ${feature} not fully implemented`);
            }
        });

        // UI/UX completeness (20 points)
        const uiFeatures = [
            'Homepage/Hero Section',
            'Mobile Responsiveness',
            'Multi-language Support'
        ];

        uiFeatures.forEach(feature => {
            if (this.checkFeatureCompletion(feature)) {
                score += 6.67; // 20/3 = 6.67 points per UI feature
            } else {
                recommendations.push(`⚠️ ${feature} needs attention`);
            }
        });

        // Performance & Security (20 points)
        const technicalFeatures = [
            'Performance Optimization',
            'Security Implementation',
            'Error Handling'
        ];

        technicalFeatures.forEach(feature => {
            if (this.checkFeatureCompletion(feature)) {
                score += 6.67; // 20/3 = 6.67 points per technical feature
            } else {
                recommendations.push(`⚠️ ${feature} requires verification`);
            }
        });

        // Testing & Documentation (20 points)
        if (this.checkFeatureCompletion('Testing Suite')) {
            score += 10;
        } else {
            recommendations.push('⚠️ Comprehensive testing needed');
        }

        if (this.checkFeatureCompletion('Documentation')) {
            score += 10;
        } else {
            recommendations.push('⚠️ Documentation needs completion');
        }

        this.completionReport.deploymentReadiness = {
            score: Math.round(score),
            blockers,
            recommendations
        };
    }

    // Helper method to check if a feature is completed
    checkFeatureCompletion(featureName) {
        if (!this.featuresData) return false;
        
        const featureSection = this.featuresData.toLowerCase();
        const feature = featureName.toLowerCase();
        
        // Look for completion indicators near the feature name
        const featureIndex = featureSection.indexOf(feature);
        if (featureIndex === -1) return false;
        
        const contextWindow = featureSection.substring(
            Math.max(0, featureIndex - 100),
            featureIndex + 200
        );
        
        return contextWindow.includes('✅') || 
               contextWindow.includes('[x]') || 
               contextWindow.includes('completed') ||
               contextWindow.includes('100%') ||
               contextWindow.includes('done');
    }

    // Calculate overall completion percentage
    calculateCompletionPercentage() {
        if (this.completionReport.totalFeatures === 0) return 0;
        
        const completed = this.completionReport.completedFeatures;
        const inProgress = this.completionReport.inProgressFeatures * 0.5; // 50% weight for in-progress
        const total = this.completionReport.totalFeatures;
        
        return Math.round(((completed + inProgress) / total) * 100);
    }

    // Generate comprehensive report
    generateReport() {
        const completionPercentage = this.calculateCompletionPercentage();
        
        console.log('\n🎯 BELL24H.COM PROJECT COMPLETION ANALYSIS');
        console.log('=' .repeat(50));
        
        console.log('\n📊 FEATURE COMPLETION BREAKDOWN:');
        console.log(`Total Features Identified: ${this.completionReport.totalFeatures}`);
        console.log(`✅ Completed Features: ${this.completionReport.completedFeatures}`);
        console.log(`⏳ In Progress Features: ${this.completionReport.inProgressFeatures}`);
        console.log(`❌ Pending Features: ${this.completionReport.pendingFeatures}`);
        
        console.log(`\n🎯 OVERALL COMPLETION: ${completionPercentage}%`);
        
        console.log('\n🚀 DEPLOYMENT READINESS ASSESSMENT:');
        console.log(`Deployment Score: ${this.completionReport.deploymentReadiness.score}/100`);
        
        if (this.completionReport.deploymentReadiness.blockers.length > 0) {
            console.log('\n🚨 CRITICAL BLOCKERS:');
            this.completionReport.deploymentReadiness.blockers.forEach(blocker => {
                console.log(`  ${blocker}`);
            });
        }
        
        if (this.completionReport.deploymentReadiness.recommendations.length > 0) {
            console.log('\n⚠️ RECOMMENDATIONS:');
            this.completionReport.deploymentReadiness.recommendations.forEach(rec => {
                console.log(`  ${rec}`);
            });
        }
        
        console.log('\n🏁 LAUNCH READINESS VERDICT:');
        if (this.completionReport.deploymentReadiness.score >= 80 && 
            this.completionReport.deploymentReadiness.blockers.length === 0) {
            console.log('🟢 READY FOR LAUNCH! 🚀');
        } else if (this.completionReport.deploymentReadiness.score >= 70) {
            console.log('🟡 SOFT LAUNCH READY - Address recommendations first');
        } else {
            console.log('🔴 NOT READY - Critical blockers must be resolved');
        }
        
        return {
            completionPercentage,
            deploymentScore: this.completionReport.deploymentReadiness.score,
            isReadyForLaunch: this.completionReport.deploymentReadiness.score >= 80 && 
                             this.completionReport.deploymentReadiness.blockers.length === 0
        };
    }

    // Main analysis method
    async analyze() {
        console.log('🔍 Starting Bell24H.com Project Analysis...');
        
        const featuresLoaded = await this.readFeaturesFile();
        const todoLoaded = await this.readTodoFile();
        
        if (!featuresLoaded && !todoLoaded) {
            console.error('❌ Cannot proceed without features.md or todo.md files');
            return null;
        }
        
        this.parseFeatureStatus();
        this.parseTodoItems();
        this.assessDeploymentReadiness();
        
        return this.generateReport();
    }
}

// Usage instructions
console.log(`
🎯 BELL24H.COM PROJECT COMPLETION ANALYZER
==========================================

USAGE:
1. Save this script as 'analyze-completion.js' in your project root
2. Run: node analyze-completion.js

REQUIREMENTS:
- features.md file in ./docs/ directory
- todo.md file in ./docs/ directory

The script will analyze:
✅ Feature completion status
⏳ In-progress items
❌ Pending tasks
🚨 Critical blockers
🚀 Deployment readiness score

`);

// Execute analysis if run directly
if (require.main === module) {
    const analyzer = new ProjectAnalyzer(process.cwd());
    analyzer.analyze().then(result => {
        if (result) {
            console.log('\n📈 ANALYSIS COMPLETE!');
            console.log(`Final Completion: ${result.completionPercentage}%`);
            console.log(`Deployment Score: ${result.deploymentScore}/100`);
            console.log(`Launch Ready: ${result.isReadyForLaunch ? 'YES' : 'NO'}`);
        }
    }).catch(console.error);
}

module.exports = ProjectAnalyzer; 