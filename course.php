<?php

class Courses {
    public static function fetchCourse($name, $role) {
        //Fetch courses from JSON file
        $courses = file_get_contents("courses/$name.json");

        // //Filter courses based on role
        // if($role !== 'admin') {
        //     $courses = array_filter($courses, function($course) use ($role) {
        //         return in_array($role, $course['roles']);
        //     });
        // }

        return $courses;
    }
}