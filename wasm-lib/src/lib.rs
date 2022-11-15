use std::f64;
use rand::Rng;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::HtmlCanvasElement;

struct Ball {
    radius: f64,
    x: f64,
    y: f64,
}

impl Ball {
    pub fn new() -> Ball {
        let mut rng = rand::thread_rng();

        Ball {
            radius: 50.0,
            x: rng.gen_range(0.0..500.0),
            y: rng.gen_range(0.0..500.0),
        }
    }
}

#[wasm_bindgen]
pub struct BouncingBalls {
    amount: usize,
    balls: Vec<Ball>,
}

#[wasm_bindgen]
impl BouncingBalls {
    #[wasm_bindgen(constructor)]
    pub fn new(amount: usize) -> BouncingBalls {
        BouncingBalls {
            amount,
            balls: Vec::with_capacity(amount),
        }
    }

    pub fn init_balls(&mut self) {
        for _n in 0..self.balls.capacity() {
            self.balls.push(Ball::new())
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

    pub fn draw(&mut self, canvas: HtmlCanvasElement) {
        let context = canvas
            .get_context("2d")
            .unwrap()
            .unwrap()
            .dyn_into::<web_sys::CanvasRenderingContext2d>()
            .unwrap();


        for ball in self.balls.iter() {
            context.begin_path();

            context.arc(ball.x, ball.y, ball.radius as f64, 0.0, f64::consts::PI * 2.0).unwrap();
            context.set_fill_style(&"red".into());
            context.fill();

            context.set_line_width(1.0);
            context.set_stroke_style(&"black".into());
            context.stroke();
        }
    }
}
