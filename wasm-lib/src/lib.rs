use rand::Rng;
use rand::rngs::ThreadRng;
use std::f64;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::HtmlCanvasElement;

const SLOWEST_VELOCITY: f64 = 1.0;
const FASTEST_VELOCITY: f64 = 5.0;

pub fn random_velocity(rng: &mut ThreadRng) -> f64 {
    let sign = num::signum((rng.gen_range(0.0..1.0) - 0.5) as f64);
    rng.gen_range(SLOWEST_VELOCITY..FASTEST_VELOCITY) * sign
}

struct Ball {
    radius: f64,
    x: f64,
    y: f64,
    dx: f64,
    dy: f64,
}

impl Ball {
    pub fn new(x: f64, y: f64, dx: f64, dy: f64) -> Ball {
        Ball {
            radius: 25.0,
            x,
            y,
            dx,
            dy,
        }
    }
}

pub fn get_ball_velocity(
    position: f64,
    velocity: f64,
    ball_radius: f64,
    border_position: f64,
) -> f64 {
    let moving_outside_lower_boundary = position <= ball_radius && velocity < 0.0;
    let moving_outside_upper_boundary = position + ball_radius >= border_position && velocity > 0.0;

    match moving_outside_lower_boundary || moving_outside_upper_boundary {
        true => velocity * -1.0,
        false => velocity,
    }
}

#[wasm_bindgen]
pub struct BouncingBalls {
    amount: usize,
    balls: Vec<Ball>,
    ball_radius: usize,
    canvas: HtmlCanvasElement,
}

#[wasm_bindgen]
impl BouncingBalls {
    #[wasm_bindgen(constructor)]
    pub fn new(amount: usize, canvas: HtmlCanvasElement) -> BouncingBalls {
        BouncingBalls {
            amount,
            balls: Vec::with_capacity(amount),
            ball_radius: 25,
            canvas,
        }
    }

    pub fn set_canvas(&mut self, canvas: HtmlCanvasElement) {
        self.canvas = canvas;
    }

    pub fn init_balls(&mut self) {
        let ball_radius = self.ball_radius as f64;
        let canvas_width = self.canvas.width() as f64;
        let canvas_height = self.canvas.height() as f64;

        let mut rng = rand::thread_rng();
        for _n in 0..self.balls.capacity() {
            let x = rng.gen_range(ball_radius..(canvas_width - ball_radius));
            let y = rng.gen_range(ball_radius..(canvas_height - ball_radius));

            self.balls.push(Ball::new(x, y, random_velocity(&mut rng), random_velocity(&mut rng)))
        }
    }

    pub fn next_tick(&mut self) {
        let canvas_width = self.canvas.width() as f64;
        let canvas_height = self.canvas.height() as f64;

        for ball in self.balls.iter_mut() {
            let new_dx = get_ball_velocity(ball.x, ball.dx, ball.radius, canvas_width);
            let new_dy = get_ball_velocity(ball.y, ball.dy, ball.radius, canvas_height);

            ball.dx = new_dx;
            ball.dy = new_dy;

            ball.x = ball.x + new_dx;
            ball.y = ball.y + new_dy;
        }
    }

    pub fn amount(&self) -> usize {
        self.balls.len()
    }

    pub fn set_amount(&mut self, amount: usize) {
        self.amount = amount;
        self.balls = Vec::with_capacity(amount);

        self.init_balls();
    }

    pub fn draw(&mut self) {
        self.next_tick();

        let context = self
            .canvas
            .get_context("2d")
            .unwrap()
            .unwrap()
            .dyn_into::<web_sys::CanvasRenderingContext2d>()
            .unwrap();

        context.clear_rect(
            0.0,
            0.0,
            self.canvas.width() as f64,
            self.canvas.height() as f64,
        );

        for ball in self.balls.iter() {
            context.begin_path();

            context
                .arc(
                    ball.x,
                    ball.y,
                    ball.radius as f64,
                    0.0,
                    f64::consts::PI * 2.0,
                )
                .unwrap();
            context.set_fill_style(&"red".into());
            context.fill();

            context.set_line_width(1.0);
            context.set_stroke_style(&"black".into());
            context.stroke();
        }
    }
}
