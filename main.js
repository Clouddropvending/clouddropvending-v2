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
    // 4. Horizontal Product Track - Hybrid Interaction Engine (Manual + Auto)
    // --------------------------------------------------------------------------
    const trackWrapper = document.querySelector('.product-track-wrapper');
    const productTrack = document.querySelector('.product-track');

    if (trackWrapper && productTrack) {
        let isInteracting = false;
        let isDragging = false;
        let startX, startScrollLeft;
        let resumeTimeout;
        const desktopSpeed = 0.85;
        const mobileSpeed = 0.6;
        const pauseDuration = 1200; // ms

        // Seam matching logic (Triple Set Reset)
        const getSetWidth = () => productTrack.scrollWidth / 3;
        let setWidth = getSetWidth();
        window.addEventListener('resize', throttle(() => { setWidth = getSetWidth(); }, 200));

        // Initial Position: Start at the middle set (Set B)
        window.addEventListener('load', () => {
            trackWrapper.scrollLeft = setWidth;
        });

        // Auto-Scroll Loop
        const autoScroll = () => {
            if (!isInteracting && !isDragging) {
                const isMob = window.innerWidth <= 768;
                const currentSpeed = isMob ? mobileSpeed : desktopSpeed;

                // On desktop we respect the wheel smoothing engine; on mobile we scroll continuously
                if (isMob || !isSmoothing) {
                    trackWrapper.scrollLeft += currentSpeed;
                }
            }
            requestAnimationFrame(autoScroll);
        };

        const markInteraction = () => {
            isInteracting = true;
            clearTimeout(resumeTimeout);
            resumeTimeout = setTimeout(() => { isInteracting = false; }, pauseDuration);
        };

        // Manual Interaction: Click + Drag
        trackWrapper.addEventListener('pointerdown', (e) => {
            isDragging = true;
            markInteraction();
            startX = e.pageX - trackWrapper.offsetLeft;
            startScrollLeft = trackWrapper.scrollLeft;
            trackWrapper.classList.add('is-dragging');
            trackWrapper.setPointerCapture(e.pointerId);
        });

        trackWrapper.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - trackWrapper.offsetLeft;
            const walk = (x - startX) * 1.5; // Drag sensitivity
            trackWrapper.scrollLeft = startScrollLeft - walk;
            markInteraction();
        });

        trackWrapper.addEventListener('pointerup', (e) => {
            isDragging = false;
            trackWrapper.classList.remove('is-dragging');
            trackWrapper.releasePointerCapture(e.pointerId);
        });

        trackWrapper.addEventListener('pointercancel', (e) => {
            isDragging = false;
            trackWrapper.classList.remove('is-dragging');
            trackWrapper.releasePointerCapture(e.pointerId);
        });

        // Wheel / Trackpad Smoothing Engine
        let targetScrollX = 0;
        let currentScrollX = 0;
        let isSmoothing = false;

        const smoothWheel = () => {
            const diff = targetScrollX - trackWrapper.scrollLeft;
            if (Math.abs(diff) > 0.5) {
                trackWrapper.scrollLeft += diff * 0.1; // Easing factor
                requestAnimationFrame(smoothWheel);
            } else {
                isSmoothing = false;
            }
        };

        trackWrapper.addEventListener('wheel', (e) => {
            // Horizontal intent check: If vertical delta is much larger, let the page scroll
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 5) {
                return;
            }

            e.preventDefault();
            markInteraction();

            // Accumulate target
            const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
            targetScrollX = trackWrapper.scrollLeft + delta * 2;

            if (!isSmoothing) {
                isSmoothing = true;
                requestAnimationFrame(smoothWheel);
            }
        }, { passive: false });

        // Mobile Touch Support (Native Scroll)
        trackWrapper.addEventListener('touchstart', markInteraction, { passive: true });
        trackWrapper.addEventListener('touchmove', markInteraction, { passive: true });

        // Bidirectional Infinite Loop Logic
        trackWrapper.addEventListener('scroll', () => {
            // If we drift too far left (into Set A), jump to Set B
            if (trackWrapper.scrollLeft < setWidth * 0.5) {
                trackWrapper.scrollLeft += setWidth;
                targetScrollX += setWidth; // Sync smoothing engine
            }
            // If we drift too far right (into Set C), jump back to Set B
            else if (trackWrapper.scrollLeft > setWidth * 1.5) {
                trackWrapper.scrollLeft -= setWidth;
                targetScrollX -= setWidth; // Sync smoothing engine
            }
        }, { passive: true });

        requestAnimationFrame(autoScroll);
    }

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
