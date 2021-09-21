<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use PharIo\Manifest\Author;

class Comment extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function post(){ // post_id
        return $this->belongsTo(Post::class);
    }

    public function author(){ //!author_id
        return $this->belongsTo(User::class, 'user_id');
    }
}
