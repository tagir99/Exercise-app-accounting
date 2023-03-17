import asyncHandler from 'express-async-handler'

import { prisma } from '../prisma.js'

// @desc    Get workouts - all workouts
// @route   GET /api/workouts
// @access  Private

export const getWorkouts = asyncHandler(async (req, res) => {
	const workouts = await prisma.workout.findMany({
		orderBy: {
			createdAt: 'desc'
		},
		include: {
			exercises: true
		}
	})

	if (!workouts) {
		res.status(404)
		throw new Error('Workout not found')
	}

	res.json(workouts)
})

// @desc    Get workout
// @route   GET /api/workout/:id
// @access  Private
export const getWorkout = asyncHandler(async (req, res) => {
	const workout = await prisma.workout.findUnique({
		where: { id: Number(req.params.id) },
		include: {
			exercises: true
		}
	})

	if (!workout) {
		res.status(404)
		throw new Error('Workout not found')
	}

	const minutes = Math.ceil(workout.exercises.length * 3.7)

	res.json({ ...workout, minutes })
})

// @desc    Create new workout
// @route 	POST /api/workouts
// @access  Private
export const createNewWorkout = asyncHandler(async (req, res) => {
	const { name, exerciseIds } = req.body

	const workout = await prisma.workout.create({
		data: {
			name,
			exercises: {
				connect: exerciseIds.map(id => ({ id: +id }))
			}
		}
	})
	// +id вместо Number(id)

	res.json(workout)
})

// @desc    Update workout
// @route 	PUT /api/workouts/:id
// @access  Private
export const updateWorkout = asyncHandler(async (req, res) => {
	const { name, exerciseIds } = req.body

	try {
		const workout = await prisma.workout.update({
			where: {
				id: Number(req.params.id)
			},
			data: {
				name,
				exercises: {
					set: exerciseIds.map(id => ({ id: +id }))
				}
			} // set - чтобы принудительно задать параметр
		})

		res.json(workout)
	} catch (error) {
		res.status(404)
		throw new Error('workout not found')
	}
})

// @desc    Delete workout
// @route 	DELETE /api/workouts/:id
// @access  Private
export const deleteWorkout = asyncHandler(async (req, res) => {
	try {
		const workout = await prisma.workout.delete({
			where: {
				id: Number(req.params.id)
			}
		})
		// req.params.id - передаётся через url

		res.json({ message: 'workout deleted!' })
	} catch (error) {
		res.status(404)
		throw new Error('workout not found')
	}
})
