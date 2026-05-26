<template>
  <aside class="side-nav">
    <div class="brand">
      <strong>408 Recall</strong>
      <span>Computer Science Prep</span>
    </div>

    <nav class="nav-list" aria-label="主导航">
      <RouterLink class="nav-link" to="/">
        <span class="material-symbols-outlined">dashboard</span>
        Home
      </RouterLink>
      <RouterLink class="nav-link" to="/review">
        <span class="material-symbols-outlined">event_repeat</span>
        Review
      </RouterLink>
      <RouterLink class="nav-link" to="/review/cram">
        <span class="material-symbols-outlined">bolt</span>
        Cram
      </RouterLink>
      <RouterLink class="nav-link" to="/cards">
        <span class="material-symbols-outlined">style</span>
        Cards
      </RouterLink>
      <RouterLink class="nav-link" to="/knowledge">
        <span class="material-symbols-outlined">account_tree</span>
        Knowledge
      </RouterLink>
      <RouterLink class="nav-link" to="/ai">
        <span class="material-symbols-outlined">auto_awesome</span>
        AI
      </RouterLink>
      <RouterLink class="nav-link" to="/mistakes">
        <span class="material-symbols-outlined">error_outline</span>
        Mistakes
      </RouterLink>
      <RouterLink class="nav-link" to="/insights">
        <span class="material-symbols-outlined">lightbulb</span>
        Insights
      </RouterLink>
      <RouterLink class="nav-link" to="/stats">
        <span class="material-symbols-outlined">query_stats</span>
        Stats
      </RouterLink>
      <div class="nav-separator"></div>
      <RouterLink class="nav-link" to="/export">
        <span class="material-symbols-outlined">download</span>
        Export
      </RouterLink>
    </nav>

    <div class="nav-footer">
      <RouterLink class="nav-link" to="/settings">
        <span class="material-symbols-outlined">settings</span>
        Settings
      </RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.nav-separator {
  height: 1px;
  background: var(--outline);
  margin: 0.5rem 0;
}
</style>
