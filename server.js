import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Fonctions utilitaires
function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes ? remainingMinutes : ''}`;
}

// Configuration d'Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(fileUpload());

// Connection à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/pathofprogress', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connecté à MongoDB avec succès !');
}).catch(err => {
    console.error('❌ Erreur de connexion MongoDB:', err);
});

// Schémas
const badgeSchema = new mongoose.Schema({
    id: String,
    name: String,
    icon: String,
    description: String,
    unlockedAt: Date,
    condition: String
});

// Schéma Quest mis à jour
const questSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['facile', 'moyen', 'difficile'],
        default: 'facile'
    },
    stat: {
        type: String,
        required: true
    },
    xpReward: {
        type: Number,
        default: function() {
            const rewards = { facile: 5, moyen: 10, difficile: 15 };
            return rewards[this.difficulty] || 5;
        }
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: Date,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new mongoose.Schema({
    avatar: {
        type: String,
        default: '/images/default-avatar.png'
    },
    avatarEmoji: {
        type: Number,
        default: 0
    },
    stats: {
        creativite: { level: { type: Number, default: 0 }, xp: { type: Number, default: 0 } },
        sante: { level: { type: Number, default: 0 }, xp: { type: Number, default: 0 } },
        connaissance: { level: { type: Number, default: 0 }, xp: { type: Number, default: 0 } },
        force: { level: { type: Number, default: 0 }, xp: { type: Number, default: 0 } },
        discipline: { level: { type: Number, default: 0 }, xp: { type: Number, default: 0 } },
        confiance: { level: { type: Number, default: 0 }, xp: { type: Number, default: 0 } },
        relations: { level: { type: Number, default: 0 }, xp: { type: Number, default: 0 } },
        richesse: { level: { type: Number, default: 0 }, xp: { type: Number, default: 0 } }
    },
    badges: [badgeSchema],
    dailyQuests: [{
        name: String,
        difficulty: String,
        stat: String,
        xpReward: Number,
        scheduledDate: Date,
        timeSlot: {
            type: String,
            enum: ['morning', 'afternoon', 'evening']
        },
        completed: Boolean,
        lastCompleted: Date
    }],
    totalXP: { type: Number, default: 0 },
    questsCompleted: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Méthode pour vérifier et débloquer les badges
userSchema.methods.checkAndUnlockBadges = function() {
    const newBadges = [];
    
    // Badge Débutant
    if (!this.badges.find(b => b.id === 'beginner')) {
        newBadges.push({
            id: 'beginner',
            name: 'Débutant',
            icon: '🌱',
            description: 'Commencez votre voyage',
            unlockedAt: new Date(),
            condition: 'Créer votre compte'
        });
    }

    // Vérifie les badges de niveau pour chaque stat
    const statBadges = {
        force: { id: 'warrior', name: 'Guerrier', icon: '⚔️' },
        connaissance: { id: 'scholar', name: 'Érudit', icon: '📚' },
        sante: { id: 'athlete', name: 'Athlète', icon: '🏃' },
        creativite: { id: 'artist', name: 'Artiste', icon: '🎨' },
        discipline: { id: 'monk', name: 'Moine', icon: '🧘' },
        relations: { id: 'leader', name: 'Leader', icon: '👥' },
        richesse: { id: 'merchant', name: 'Marchand', icon: '💰' }
    };

    for (const [stat, badge] of Object.entries(statBadges)) {
        if (this.stats[stat].level >= 5 && !this.badges.find(b => b.id === badge.id)) {
            newBadges.push({
                ...badge,
                description: `Atteignez niveau 5 en ${stat}`,
                unlockedAt: new Date(),
                condition: `${stat} niveau 5`
            });
        }
    }

    if (newBadges.length > 0) {
        this.badges.push(...newBadges);
    }

    return newBadges;
};

// Modèles
const User = mongoose.model('User', userSchema);
const Quest = mongoose.model('Quest', questSchema);

// Configuration globale des stats
const stats = {
    creativite: { icon: 'palette', label: 'Créativité', color: '#FF6B6B', emoji: '🎨' },
    sante: { icon: 'heart', label: 'Santé', color: '#4ECDC4', emoji: '❤️' },
    connaissance: { icon: 'book-open', label: 'Connaissance', color: '#45B7D1', emoji: '📚' },
    force: { icon: 'dumbbell', label: 'Force', color: '#96CEB4', emoji: '💪' },
    discipline: { icon: 'target', label: 'Discipline', color: '#D4A373', emoji: '🎯' },
    confiance: { icon: 'smile', label: 'Confiance en soi', color: '#FFD93D', emoji: '😊' },
    relations: { icon: 'users', label: 'Relations sociales', color: '#FF8066', emoji: '👥' },
    richesse: { icon: 'coins', label: 'Richesse', color: '#95D5B2', emoji: '💰' }
};

// Routes API
app.post('/api/upload-avatar', async (req, res) => {
    if (!req.files || !req.files.avatar) {
        return res.status(400).json({ success: false, message: 'Aucun fichier uploadé' });
    }

    try {
        const avatarFile = req.files.avatar;
        const uploadPath = path.join(__dirname, 'public/images/avatars', `avatar-${Date.now()}${path.extname(avatarFile.name)}`);
        
        await avatarFile.mv(uploadPath);
        
        const user = await User.findOne();
        user.avatar = `/images/avatars/${path.basename(uploadPath)}`;
        await user.save();

        res.json({ success: true, avatarUrl: user.avatar });
    } catch (error) {
        console.error('Erreur upload avatar:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'upload' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const user = await User.findOne();
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        res.json({ success: true, stats: user.stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Nouvelle route de création de quête
app.post('/api/create-quest', async (req, res) => {
    console.log('Body complet reçu:', req.body);
    const { name, difficulty, stat, scheduledDate, timeSlot } = req.body;

    try {
        // Validation des données
        if (!name || !difficulty || !stat || !scheduledDate || !timeSlot) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis'
            });
        }

        // Valider la date
        const schedDate = new Date(scheduledDate);
        const now = new Date();
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 14);

        if (schedDate < now || schedDate > maxDate) {
            return res.status(400).json({
                success: false,
                message: 'La date doit être comprise entre aujourd\'hui et dans 14 jours'
            });
        }

        const user = await User.findOne();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        const xpRewards = {
            'facile': 5,
            'moyen': 10,
            'difficile': 15
        };

        // Créer la nouvelle quête
        const newQuest = {
            name,
            difficulty,
            stat,
            xpReward: xpRewards[difficulty] || 5,
            scheduledDate: schedDate,
            timeSlot,
            completed: false
        };

        // Ajouter la quête à l'utilisateur
        user.dailyQuests.push(newQuest);
        await user.save();

        res.json({
            success: true,
            quest: newQuest,
            message: 'Quête créée avec succès !'
        });
    } catch (error) {
        console.error('Erreur lors de la création de la quête:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la quête',
            error: error.message
        });
    }
});

// Route de complétion des quêtes
app.post('/api/complete-quest', async (req, res) => {
    try {
        const user = await User.findOne();
        const questId = req.body.questId;
        
        const quest = user.dailyQuests.id(questId);
        if (!quest) {
            return res.status(404).json({ success: false, error: 'Quête non trouvée' });
        }

        if (!quest.completed) {
            // Marquer la quête comme complétée
            quest.completed = true;
            quest.lastCompleted = new Date();
            
            // Créer une entrée dans l'historique
            await Quest.create({
                name: quest.name,
                difficulty: quest.difficulty,
                stat: quest.stat,
                xpReward: quest.xpReward,
                scheduledDate: quest.scheduledDate,
                timeSlot: quest.timeSlot,
                completed: true,
                completedAt: new Date(),
                userId: user._id
            });
            
            // Mise à jour des stats
            const stat = quest.stat.toLowerCase();
            user.stats[stat].xp += quest.xpReward;
            user.totalXP += quest.xpReward;
            user.questsCompleted += 1;
            
            // Vérification du level up
            const xpNeeded = user.stats[stat].level * 10 + 10;
            if (user.stats[stat].xp >= xpNeeded) {
                user.stats[stat].level += 1;
                user.stats[stat].xp -= xpNeeded;
            }
            
            // Vérification des badges
            const newBadges = user.checkAndUnlockBadges();
            
            await user.save();
            res.json({ 
                success: true, 
                user,
                quest,
                newBadges,
                message: `Quête complétée ! +${quest.xpReward} XP en ${quest.stat}`
            });
        } else {
            res.json({ success: false, message: 'Quête déjà complétée' });
        }
    } catch (error) {
        console.error('Erreur lors de la complétion de la quête:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route principale
// Dans la route principale (app.get('/'))
app.get('/', async (req, res) => {
    try {
        let user = await User.findOne();
        if (!user) {
            user = await User.create({
                stats: {
                    creativite: { level: 0, xp: 0 },
                    sante: { level: 0, xp: 0 },
                    connaissance: { level: 0, xp: 0 },
                    force: { level: 0, xp: 0 },
                    discipline: { level: 0, xp: 0 },
                    confiance: { level: 0, xp: 0 },
                    relations: { level: 0, xp: 0 },
                    richesse: { level: 0, xp: 0 }
                }
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Organiser les quêtes par créneau horaire
        const organizedQuests = {
            morning: [],
            afternoon: [],
            evening: []
        };

        user.dailyQuests.forEach(quest => {
            const questDate = new Date(quest.scheduledDate);
            questDate.setHours(0, 0, 0, 0);
            
            if (questDate.getTime() === today.getTime()) {
                organizedQuests[quest.timeSlot].push(quest);
            }
        });

        // Calcul des statistiques des quêtes
        const totalQuests = user.dailyQuests.length;
        const completedQuests = user.dailyQuests.filter(quest => quest.completed).length;
        const hasAnyQuests = totalQuests > 0;

        // Calcul des autres statistiques...
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const questsLastWeek = await Quest.find({
            completedAt: { $gte: lastWeek }
        }).countDocuments();

        const weeklyGrowth = await calculateWeeklyGrowth();

        // Rendu de la page avec toutes les variables nécessaires
        res.render('index', { 
            user,
            stats,
            organizedQuests,
            totalQuests,
            completedQuests,
            hasAnyQuests,
            weeklyGrowth,
			formatDate,
			formatDuration,
			timeSlots: {
                morning: '🌅 Matin (6h - 12h)',
                afternoon: '☀️ Après-midi (12h - 18h)',
                evening: '🌙 Soirée (18h - 00h)'
            }
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).send('Erreur serveur');
    }
});

// Fonction pour calculer la croissance hebdomadaire
async function calculateWeeklyGrowth() {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const questsLastWeek = await Quest.find({
        completedAt: { $gte: lastWeek }
    }).countDocuments();

    const questsPreviousWeek = await Quest.find({
        completedAt: {
            $gte: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
            $lt: lastWeek
        }
    }).countDocuments();

    return questsPreviousWeek === 0 ? 100 : 
        Math.round((questsLastWeek - questsPreviousWeek) / questsPreviousWeek * 100);
}

// Fonctions auxiliaires
async function calculatePreviousCompletionRate() {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const totalPreviousQuests = await Quest.countDocuments({
        createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo }
    });

    const completedPreviousQuests = await Quest.countDocuments({
        completed: true,
        completedAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo }
    });

    return totalPreviousQuests > 0 ? Math.round((completedPreviousQuests / totalPreviousQuests) * 100) : 0;
}

async function calculateXPForPeriod(startDate) {
    const quests = await Quest.find({
        completed: true,
        completedAt: { $gte: startDate }
    });

    return quests.reduce((total, quest) => total + (quest.xpReward || 0), 0);
}

async function calculateCurrentStreak(userId) {
    const user = await User.findById(userId);
    if (!user) return 0;

    let currentDate = new Date();
    let streak = 0;
    let hasActivityToday = false;

    const todayStart = new Date(currentDate.setHours(0, 0, 0, 0));
    const todayQuests = user.dailyQuests.filter(quest => 
        quest.completed && 
        quest.lastCompleted && 
        new Date(quest.lastCompleted) >= todayStart
    );

    if (todayQuests.length > 0) {
        hasActivityToday = true;
        streak = 1;
    }

    let checkDate = new Date(todayStart);
    checkDate.setDate(checkDate.getDate() - 1);

    while (true) {
        const dayQuests = user.dailyQuests.filter(quest =>
            quest.completed &&
            quest.lastCompleted &&
            new Date(quest.lastCompleted).toDateString() === checkDate.toDateString()
        );

        if (dayQuests.length === 0) {
            break;
        }

        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
}

// Démarrage du serveur
app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});