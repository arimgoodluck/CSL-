import pygame
import random
import math

pygame.init()

# ----------------------------
# Window + Background
# ----------------------------
WIDTH, HEIGHT = 1000, 1000
window = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Bubble Pop Game for Sunshine Snacks (Demo)")
clock = pygame.time.Clock()

# Background
background_image = pygame.image.load("sunshinesnacks.png").convert_alpha()
background_image = pygame.transform.scale(background_image, (WIDTH, HEIGHT))
background_image.set_alpha(125)  # set once

# ----------------------------
# Load Snacks
# ----------------------------
snack_surfaces = [
    pygame.image.load("plantain.png").convert_alpha(),
    pygame.image.load("bigfoot.png").convert_alpha(),
    pygame.image.load("zoomers.png").convert_alpha(),
    pygame.image.load("cheese_sticks.png").convert_alpha(),
    pygame.image.load("raisin.png").convert_alpha(),
    pygame.image.load("almond.png").convert_alpha(),
    pygame.image.load("cashew.png").convert_alpha(),
]

# ----------------------------
# Game Settings
# ----------------------------
SPAWN_EVERY_MS = 500
MAX_SNACKS = 20

FLOAT_SPEED_RANGE = (100, 150)     # px/sec
WOBBLE_AMP_RANGE = (10, 28)       # px
WOBBLE_FREQ_RANGE = (1.0, 1.8)
SPIN_RANGE = (-25, 25)            # deg/sec

CRUMB_COUNT_RANGE = (14, 22)
CRUMB_SPEED_RANGE = (120, 260)
CRUMB_LIFE_RANGE = (0.45, 0.8)    # seconds

score = 0
font = pygame.font.SysFont(None, 48)

def clamp(v, lo, hi):
    return max(lo, min(hi, v))

# ----------------------------
# Crumb Particle
# ----------------------------
class Crumb:
    def __init__(self, x, y):
        angle = random.uniform(0, math.tau)
        speed = random.uniform(*CRUMB_SPEED_RANGE)
        self.vx = math.cos(angle) * speed
        self.vy = math.sin(angle) * speed - 60  # small upward bias
        self.x = x
        self.y = y
        self.life = random.uniform(*CRUMB_LIFE_RANGE)
        self.max_life = self.life
        self.radius = random.randint(2, 4)

    def update(self, dt):
        self.vy += 420 * dt  # gravity
        self.x += self.vx * dt
        self.y += self.vy * dt
        self.life -= dt

    def draw(self, surf):
        if self.life <= 0:
            return

        alpha = int(255 * (self.life / self.max_life))
        alpha = clamp(alpha, 0, 255)

        crumb_surf = pygame.Surface((self.radius * 2 + 2, self.radius * 2 + 2), pygame.SRCALPHA)
        pygame.draw.circle(
            crumb_surf,
            (230, 170, 60, alpha),  # warm crumb color
            (self.radius + 1, self.radius + 1),
            self.radius,
        )
        surf.blit(crumb_surf, (self.x - self.radius, self.y - self.radius))

# ----------------------------
# Snack Bubble
# ----------------------------
class SnackBubble:
    def __init__(self):
        # Choose which snack this bubble is
        self.base = random.choice(snack_surfaces)

        # Default scale
        self.scale = random.uniform(0.22, 0.36)

        # Auto-scale by image size:
        # very large image -> scale down a bit
        if self.base.get_width() > 900 or self.base.get_height() > 900:
            self.scale = random.uniform(0.18, 0.28)

        # smaller image (like zoomers) -> smaller scale
        if self.base.get_width() < 700 and self.base.get_height() < 700:
            self.scale = random.uniform(0.16, 0.24)

        self.img = pygame.transform.smoothscale(
            self.base,
            (int(self.base.get_width() * self.scale), int(self.base.get_height() * self.scale))
        )

        self.x = random.uniform(60, WIDTH - 60)
        self.y = HEIGHT + random.uniform(50, 250)

        self.speed = random.uniform(*FLOAT_SPEED_RANGE)
        self.amp = random.uniform(*WOBBLE_AMP_RANGE)
        self.freq = random.uniform(*WOBBLE_FREQ_RANGE)
        self.phase = random.uniform(0, math.tau)

        self.angle = random.uniform(0, 360)
        self.spin = random.uniform(*SPIN_RANGE)

        # click radius
        self.hit_r = max(self.img.get_width(), self.img.get_height()) * 0.35

    def update(self, dt, t):
        self.y -= self.speed * dt
        self.x += math.sin(t * self.freq + self.phase) * self.amp * dt
        self.angle += self.spin * dt

    def draw(self, surf):
        rotated = pygame.transform.rotozoom(self.img, self.angle, 1.0)
        rect = rotated.get_rect(center=(self.x, self.y))
        surf.blit(rotated, rect)

    def is_off_screen(self):
        return self.y < -120

    def hit_test(self, mx, my):
        return (mx - self.x) ** 2 + (my - self.y) ** 2 <= self.hit_r ** 2

snacks = []
crumbs = []

SPAWN_EVENT = pygame.USEREVENT + 1
pygame.time.set_timer(SPAWN_EVENT, SPAWN_EVERY_MS)

# ----------------------------
# Main Loop
# ----------------------------
running = True
t = 0.0

while running:
    dt = clock.tick(60) / 1000.0
    t += dt

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        # Spawn snack bubbles
        if event.type == SPAWN_EVENT:
            if len(snacks) < MAX_SNACKS:
                snacks.append(SnackBubble())

        # Click to pop
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            mx, my = pygame.mouse.get_pos()
            for i in range(len(snacks) - 1, -1, -1):
                if snacks[i].hit_test(mx, my):
                    score += 10
                    cx, cy = snacks[i].x, snacks[i].y
                    snacks.pop(i)

                    for _ in range(random.randint(*CRUMB_COUNT_RANGE)):
                        crumbs.append(Crumb(cx, cy))
                    break

    # Update
    for s in snacks[:]:
        s.update(dt, t)
        if s.is_off_screen():
            snacks.remove(s)

    for c in crumbs[:]:
        c.update(dt)
        if c.life <= 0:
            crumbs.remove(c)

    # Draw
    window.fill((255, 255, 255))
    window.blit(background_image, (0, 0))

    for s in snacks:
        s.draw(window)

    for c in crumbs:
        c.draw(window)

    # Score text + shadow for readability
    shadow = font.render(f"Score: {score}", True, (0, 0, 0))
    score_text = font.render(f"Score: {score}", True, (255, 255, 255))
    window.blit(shadow, (22, 22))
    window.blit(score_text, (20, 20))

    pygame.display.flip()

pygame.quit()
