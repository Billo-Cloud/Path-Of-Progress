<section id="stats" class="section tab-content">
    <div class="stats-container">
        <h2 class="section-title">Statistiques</h2>
        
        <!-- Vue d'ensemble -->
        <div class="stats-overview">
            <div class="total-level">
                <%
                // Calcul de la progression totale
                const maxLevel = 100; // Niveau maximum possible
                const currentLevel = Object.values(user.stats).reduce((sum, stat) => sum + stat.level, 0);
                const totalProgress = Math.min((currentLevel / maxLevel) * 100, 100).toFixed(2);
                %>
                <div class="level-circle">
                    <svg viewBox="0 0 36 36" class="circular-chart">
                        <path class="circle-bg" d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="circle" stroke-dasharray="<%= totalProgress %>, 100" d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <text x="18" y="20.35" class="percentage"><%= currentLevel %></text>
                    </svg>
                    <span>Niveau Global</span>
                </div>
            </div>
        </div>

        <!-- Grille des stats -->
        <div class="stats-grid">
            <% Object.entries(stats).forEach(([key, stat]) => { 
                const statData = user.stats[key];
                const xpNeeded = (statData.level + 1) * 10;
                const progress = Math.min((statData.xp / xpNeeded) * 100, 100).toFixed(2);
            %>
                <div class="stat-card" data-stat="<%= key %>">
                    <div class="stat-header">
                        <div class="stat-icon"><%= stat.emoji %></div>
                        <h3><%= stat.label %></h3>
                    </div>
                    
                    <div class="stat-details">
                        <div class="level-info">
                            <span class="level">Niveau <%= statData.level %></span>
                            <div class="xp-info">
                                <%= statData.xp %>/<%= xpNeeded %> XP
                            </div>
                        </div>

                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress" 
                                     style="width: <%= progress %>%; 
                                            background: <%= stat.color %>">
                                </div>
                            </div>
                        </div>

                        <!-- Mini graphique de progression -->
                        <div class="mini-chart">
                            <canvas id="chart-<%= key %>" width="150" height="50"></canvas>
                        </div>

                        <!-- Temps estimé avant prochain niveau -->
                        <div class="next-level-estimate">
                            <i class="time-icon">⏱️</i>
                            <span>
                                <% const xpRemaining = xpNeeded - statData.xp; %>
                                <% const daysEstimate = Math.ceil(xpRemaining / 5); %>
                                <%= daysEstimate %> jour<%= daysEstimate > 1 ? 's' : '' %> avant niveau suivant
                            </span>
                        </div>

                        <!-- Badges -->
                        <div class="stat-badges">
                            <% const badges = (user.badges || []).filter(b => b.stat === key) %>
                            <% badges.forEach(badge => { %>
                                <div class="badge <%= badge.unlocked ? 'unlocked' : 'locked' %>" 
                                     title="<%= badge.description %>">
                                    <%= badge.icon %>
                                </div>
                            <% }) %>
                        </div>
                    </div>

                    <div class="stat-footer">
                        <button class="details-btn" onclick="showStatDetails('<%= key %>')">
                            Voir les détails
                        </button>
                    </div>
                </div>
            <% }) %>
        </div>
    </div>

    <!-- Modal des détails -->
    <div id="stat-details-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <div id="stat-details-content"></div>
        </div>
    </div>
</section>