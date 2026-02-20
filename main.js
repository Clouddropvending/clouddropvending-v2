// Cloud Drop Vending V2 - Main Interaction Logic

document.addEventListener('DOMContentLoaded', () => {
    // Helper: Throttle Utility
    const throttle = (func, limit) => {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    };

    // --------------------------------------------------------------------------
    // 1. Scroll Reveal Animations
    // --------------------------------------------------------------------------
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up, .animate-on-scroll').forEach(el => observer.observe(el));

    // --------------------------------------------------------------------------
    // 1b. Ambient Animation Observer (Toggles continuous effects while in view)
    // --------------------------------------------------------------------------
    const ambientOptions = {
        threshold: 0.2 // Trigger when 20% of section is visible
    };

    const ambientObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('ambient-active');
            } else {
                entry.target.classList.remove('ambient-active');
            }
        });
    }, ambientOptions);

    const revenueSection = document.querySelector('.indirect-revenue');
    if (revenueSection) {
        ambientObserver.observe(revenueSection);
    }

    // --------------------------------------------------------------------------
    // 2. Accordion Logic
    // --------------------------------------------------------------------------
    const accordions = document.querySelectorAll('.accordion-item');
    if (accordions.length > 0) {
        accordions.forEach(item => {
            const header = item.querySelector('.accordion-header');
            if (!header) return;

            const toggleAccordion = () => {
                const isActive = item.classList.contains('active');

                accordions.forEach(acc => {
                    acc.classList.remove('active');
                    const content = acc.querySelector('.accordion-content');
                    if (content) content.style.maxHeight = null;
                    const h = acc.querySelector('.accordion-header');
                    if (h) h.setAttribute('aria-expanded', 'false');
                });

                if (!isActive) {
                    item.classList.add('active');
                    const content = item.querySelector('.accordion-content');
                    if (content) {
                        content.style.maxHeight = content.scrollHeight + 'px';
                        header.setAttribute('aria-expanded', 'true');
                    }
                }
            };
            header.addEventListener('click', toggleAccordion);
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAccordion();
                }
            });
        });
    }

    // --------------------------------------------------------------------------
    // 3. Back to Top Button
    // --------------------------------------------------------------------------
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --------------------------------------------------------------------------
    // --------------------------------------------------------------------------
    // --------------------------------------------------------------------------
    // --------------------------------------------------------------------------
    // --------------------------------------------------------------------------
    // Curated Essentials Carousel - TRANSFORM BASED + MANUAL DRAG
    // --------------------------------------------------------------------------
    const initCuratedCarousel = () => {
        const scroller = document.querySelector('.curated-carousel-scroller');
        const track = document.querySelector('.curated-carousel-track');
        if (!scroller || !track) return;

        const SPEED = 40; // px per second

        let offset = 0;
        let last = 0;
        let isPaused = false;

        // Manual drag state
        let isDown = false;
        let startX = 0;
        let startOffset = 0;
        let lastMoveTime = 0;

        const firstGroup = track.querySelector('.product-group');
        let groupWidth = 0;

        const sync = () => {
            if (!firstGroup) return;
            groupWidth = firstGroup.getBoundingClientRect().width || 0;
        };

        const apply = () => {
            // Keep offset in [0, groupWidth)
            if (groupWidth > 0) {
                offset = ((offset % groupWidth) + groupWidth) % groupWidth;
            }
            track.style.transform = `translate3d(${-offset}px, 0, 0)`;
        };

        const pause = () => {
            isPaused = true;
            clearTimeout(pause._t);
            pause._t = setTimeout(() => (isPaused = false), 1500);
        };

        const loop = (t) => {
            if (!last) last = t;
            let dt = (t - last) / 1000;
            last = t;

            // Prevent big "jumps" if the tab was inactive / FPS drops
            dt = Math.min(dt, 0.05);

            if (!isPaused && !isDown && groupWidth > 0) {
                offset += SPEED * dt;
                apply();
            }

            requestAnimationFrame(loop);
        };

        // -------------------------
        // Manual drag (pointer)
        // -------------------------
        const onPointerDown = (e) => {
            pause();
            isDown = true;
            startX = e.clientX;
            startOffset = offset;
            lastMoveTime = performance.now();
            scroller.setPointerCapture?.(e.pointerId);
            scroller.classList.add('is-dragging');
        };

        const onPointerMove = (e) => {
            if (!isDown) return;
            const dx = e.clientX - startX;
            // Dragging right should move content right (so offset decreases)
            offset = startOffset - dx;
            apply();
            lastMoveTime = performance.now();
        };

        const onPointerUp = () => {
            if (!isDown) return;
            isDown = false;
            scroller.classList.remove('is-dragging');

            // small extra pause after finishing drag so it doesn't "snap back into auto"
            clearTimeout(pause._t);
            pause._t = setTimeout(() => (isPaused = false), 900);
        };

        scroller.addEventListener('pointerdown', onPointerDown, { passive: true });
        scroller.addEventListener('pointermove', onPointerMove, { passive: true });
        scroller.addEventListener('pointerup', onPointerUp, { passive: true });
        scroller.addEventListener('pointercancel', onPointerUp, { passive: true });

        // Wheel = manual scrub
        scroller.addEventListener(
            'wheel',
            (e) => {
                pause();
                offset += e.deltaY * 0.6 + e.deltaX * 0.9;
                apply();
            },
            { passive: true }
        );

        window.addEventListener('resize', () => {
            sync();
            apply();
        });

        // Make transforms smooth
        track.style.willChange = 'transform';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                sync();
                apply();
                requestAnimationFrame(loop);
            });
        });
    };

    initCuratedCarousel();
    // --------------------------------------------------------------------------
    // 5. Hero Cluster Parallax - Immersive Depth
    // --------------------------------------------------------------------------
    const hero = document.querySelector('.hero');
    const floatViewports = document.querySelectorAll('.hero-card-viewport');

    if (hero && floatViewports.length > 0) {
        // Accessibility Check
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) return;

        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;

        const lerp = (start, end, factor) => start + (end - start) * factor;

        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) - 0.5;
            mouseY = (e.clientY / window.innerHeight) - 0.5;
        }, { passive: true });

        const updateParallax = () => {
            currentX = lerp(currentX, mouseX, 0.04);
            currentY = lerp(currentY, mouseY, 0.04);

            floatViewports.forEach(viewport => {
                const depth = parseFloat(viewport.getAttribute('data-parallax-depth')) || 0.1;
                // Excursion: mouseX(0.5) * factor(60) * depth(0.2) = 6px max offset
                const tx = currentX * 60 * depth;
                const ty = currentY * 60 * depth;

                viewport.style.setProperty('--tx', `${tx}px`);
                viewport.style.setProperty('--ty', `${ty}px`);
            });

            requestAnimationFrame(updateParallax);
        }

        requestAnimationFrame(updateParallax);
    }

    // --------------------------------------------------------------------------
    // 9. Revenue Impact Calculator Logic
    // --------------------------------------------------------------------------
    const calc = {
        inputs: [
            'guests_per_night', 'nights_per_week', 'purchase_rate',
            'group_prevent_rate', 'avg_group_size'
        ],
        init() {
            const container = document.querySelector('.revenue-calculator');
            if (!container) return;

            this.bindEvents();
            this.calculate(); // Initial run
            this.initTrayWatcher();
        },
        bindEvents() {
            this.inputs.forEach(id => {
                const slider = document.getElementById(id);
                const number = document.getElementById(`${id}_val`);

                if (slider && number) {
                    slider.addEventListener('input', (e) => {
                        number.value = e.target.value;
                        this.calculate();
                    });
                    number.addEventListener('input', (e) => {
                        slider.value = e.target.value;
                        this.calculate();
                    });
                }
            });
        },

        initTrayWatcher() {
            const tray = document.getElementById('mobileResultsTray');
            const calcSection = document.getElementById('calculator');
            const resultsSection = document.querySelector('.calculator-results');
            let collapseTimer = null;

            if (!tray || !calcSection || !resultsSection) return;

            const resetCollapseTimer = () => {
                if (collapseTimer) clearTimeout(collapseTimer);
                if (tray.classList.contains('expanded')) {
                    collapseTimer = setTimeout(() => {
                        tray.classList.remove('expanded');
                    }, 8000); // 8 second inactivity period
                }
            };

            // Show tray when calculator is in view, hide when results are in view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (window.innerWidth > 768) {
                        tray.classList.remove('visible');
                        return;
                    }

                    if (entry.target === calcSection) {
                        if (entry.isIntersecting) {
                            tray.classList.add('visible');
                        } else {
                            // Only hide if we've scrolled way past the calculator
                            const rect = calcSection.getBoundingClientRect();
                            if (rect.bottom < 0 || rect.top > window.innerHeight) {
                                tray.classList.remove('visible');
                                tray.classList.remove('expanded');
                            }
                        }
                    }

                    // Hide tray when we've reached the actual results section
                    if (entry.target === resultsSection) {
                        if (entry.isIntersecting) {
                            tray.classList.remove('visible');
                            tray.classList.remove('expanded');
                        } else {
                            // Re-show if we scroll back up to the inputs
                            const calcRect = calcSection.getBoundingClientRect();
                            if (calcRect.bottom > 0 && calcRect.top < window.innerHeight) {
                                tray.classList.add('visible');
                            }
                        }
                    }
                });
            }, { threshold: [0, 0.05] });

            observer.observe(calcSection);
            observer.observe(resultsSection);

            // Toggle expansion
            tray.addEventListener('click', (e) => {
                tray.classList.toggle('expanded');
                resetCollapseTimer();
            });

            // Prevent auto-hide during interaction
            window.addEventListener('scroll', () => {
                if (tray.classList.contains('visible')) resetCollapseTimer();
            });

            // Monitor slider interactions
            this.inputs.forEach(id => {
                const slider = document.getElementById(id);
                if (slider) {
                    slider.addEventListener('input', resetCollapseTimer);
                    slider.addEventListener('touchstart', resetCollapseTimer);
                }
            });
        },

        calculate() {
            // Get raw values
            const val = (id) => parseFloat(document.getElementById(id).value);

            const guests = val('guests_per_night');
            const nights = val('nights_per_week');
            const pRate = val('purchase_rate') / 100;
            const spend = 35; // Fixed assumption

            // Shared Constants
            const vShare = 0.10;

            // Retention Model Parameters
            const gPrevent = val('group_prevent_rate') / 100;
            const gSize = val('avg_group_size');
            const spendRetained = 10; // Fixed typical value to reduce mobile clutter

            // 1. Revenue Share
            const buyersPerNight = guests * pRate;
            const salesPerNight = buyersPerNight * spend;
            const venueSharePerNight = salesPerNight * vShare;
            const monthlyVenueShare = venueSharePerNight * nights * 4.33;

            // 2. Group Retention
            const preventedGroups = buyersPerNight * gPrevent;
            const retainedGuests = preventedGroups * gSize;
            const addedBarRevPerNight = retainedGuests * spendRetained;
            const monthlyBarRev = addedBarRevPerNight * nights * 4.33;

            // 3. Totals
            const totalMonthlyImpact = monthlyVenueShare + monthlyBarRev;
            const totalPerNight = venueSharePerNight + addedBarRevPerNight;
            const totalWeekly = totalPerNight * nights;

            // Update UI
            const format = (num) => new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
            }).format(num);

            document.getElementById('total_impact_val').textContent = format(totalMonthlyImpact);
            document.getElementById('monthly_venue_share_val').textContent = format(monthlyVenueShare);
            document.getElementById('monthly_bar_rev_val').textContent = format(monthlyBarRev);
            document.getElementById('per_night_total_val').textContent = format(totalPerNight);
            document.getElementById('weekly_total_val').textContent = format(totalWeekly);

            // Summary text
            const sGuests = document.getElementById('summary_guests');
            const sNights = document.getElementById('summary_nights');
            if (sGuests) sGuests.textContent = guests;
            if (sNights) sNights.textContent = nights;

            // Update Tray
            const trayTotal = document.getElementById('tray_total');
            const trayShare = document.getElementById('tray_share');
            const trayBar = document.getElementById('tray_bar');
            const trayNight = document.getElementById('tray_night');
            const trayWeek = document.getElementById('tray_week');

            if (trayTotal) trayTotal.textContent = format(totalMonthlyImpact);
            if (trayShare) trayShare.textContent = format(monthlyVenueShare);
            if (trayBar) trayBar.textContent = format(monthlyBarRev);
            if (trayNight) trayNight.textContent = format(totalPerNight);
            if (trayWeek) trayWeek.textContent = format(totalWeekly);
        }
    };

    calc.init();

    // --------------------------------------------------------------------------
    // 8. Mobile-Only hardware Reveal (Simple Pass)
    // --------------------------------------------------------------------------
    const initMobileHardwareReveal = () => {
        if (window.innerWidth > 768) return;

        const hardwareCards = document.querySelectorAll('.hardware-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('mobile-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        hardwareCards.forEach(card => observer.observe(card));
    };

    // Initialize all enhancements
    if (typeof initMobileHardwareReveal === 'function') initMobileHardwareReveal();
});
